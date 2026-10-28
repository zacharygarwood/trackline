import { describe, expect, it } from 'vitest';
import { aFood, macros } from '../../../../tests/builders/nutrition.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { createDailyGoals, goalsOn } from './daily-goals.ts';
import { summarizeDay } from './daily-nutrition-summary.ts';
import { changeAmount, logFood } from './food-log-entry.ts';
import { createFood, macrosForAmount } from './food.ts';
import { addMacros, createMacros, InvalidMacros, scaleMacros } from './macros.ts';
import { MealSlot } from './meal-slot.constants.ts';
import { mealSlotAt } from './meal-slot.ts';
import { InvalidName } from './name.ts';
import { createPortion, InvalidAmount, InvalidUnit } from './portion.ts';
import { createSavedMeal, EmptyMeal } from './saved-meal.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const placement = {
	id: anId<'FoodLogEntry'>(),
	date: date('2026-10-27'),
	slot: MealSlot.lunch,
	loggedAt: 0
};

describe('macros', () => {
	it('add and scale', () => {
		expect(addMacros(macros(100, 10, 5, 2), macros(50, 5, 5, 1))).toEqual(macros(150, 15, 10, 3));
		expect(scaleMacros(macros(100, 10, 5, 2), 1.5)).toEqual(macros(150, 15, 7.5, 3));
	});

	it.each([macros(-1, 0, 0, 0), macros(0, Number.NaN, 0, 0)])('reject %j', (value) => {
		expect(expectErr(createMacros(value))).toBeInstanceOf(InvalidMacros);
	});
});

describe('portions', () => {
	it('trims the unit', () => {
		expect(expectOk(createPortion({ amount: 1, unit: ' slice ' }))).toEqual({
			amount: 1,
			unit: 'slice'
		});
	});

	it('rejects a zero amount and an empty unit', () => {
		expect(expectErr(createPortion({ amount: 0, unit: 'g' }))).toBeInstanceOf(InvalidAmount);
		expect(expectErr(createPortion({ amount: 1, unit: ' ' }))).toBeInstanceOf(InvalidUnit);
	});
});

describe('foods', () => {
	it('scales macros linearly with the amount eaten', () => {
		const chicken = aFood('Chicken')
			.per(100, 'g')
			.with(macros(165, 31, 0, 3.6))
			.build();

		expect(expectOk(macrosForAmount(chicken, 150))).toEqual(macros(247.5, 46.5, 0, 5.4));
	});

	it('works with named servings', () => {
		const bread = aFood('Bread')
			.per(1, 'slice')
			.with(macros(80, 3, 15, 1))
			.build();

		expect(expectOk(macrosForAmount(bread, 2))).toEqual(macros(160, 6, 30, 2));
	});

	it('rejects a non-positive amount', () => {
		expect(expectErr(macrosForAmount(aFood().build(), 0))).toBeInstanceOf(InvalidAmount);
	});

	it('rejects an empty name', () => {
		expect(
			expectErr(
				createFood({
					id: anId(),
					name: '',
					reference: { amount: 1, unit: 'g' },
					macrosPerReference: macros(0, 0, 0, 0)
				})
			)
		).toBeInstanceOf(InvalidName);
	});
});

describe('food log entries', () => {
	const oats = aFood('Oats')
		.per(100, 'g')
		.with(macros(389, 17, 66, 7))
		.build();

	it('snapshot the food when logged', () => {
		const entry = expectOk(logFood(oats, 50, placement));

		expect(entry.foodNameSnapshot).toBe('Oats');
		expect(entry.unitSnapshot).toBe('g');
		expect(entry.macrosSnapshot).toEqual(macros(194.5, 8.5, 33, 3.5));
	});

	it('keep their snapshot when the amount changes', () => {
		const entry = expectOk(changeAmount(expectOk(logFood(oats, 50, placement)), 100));

		expect(entry.macrosSnapshot).toEqual(macros(389, 17, 66, 7));
	});

	it('reject a non-positive amount', () => {
		expect(expectErr(changeAmount(expectOk(logFood(oats, 50, placement)), -1))).toBeInstanceOf(
			InvalidAmount
		);
	});
});

describe('saved meals', () => {
	it('need at least one food', () => {
		expect(expectErr(createSavedMeal({ id: anId(), name: 'Breakfast', items: [] }))).toBeInstanceOf(
			EmptyMeal
		);
	});

	it('need positive amounts', () => {
		expect(
			expectErr(
				createSavedMeal({ id: anId(), name: 'Breakfast', items: [{ foodId: anId(), amount: 0 }] })
			)
		).toBeInstanceOf(InvalidAmount);
	});
});

describe('daily goals', () => {
	const version = (from: string, calories: number) =>
		expectOk(
			createDailyGoals({ targets: macros(calories, 150, 200, 70), effectiveFrom: date(from) })
		);

	it('judge each day by the version in effect then', () => {
		const versions = [version('2026-10-20', 2500), version('2026-10-01', 2200)];

		expect(goalsOn(versions, date('2026-10-10'))?.targets.calories).toBe(2200);
		expect(goalsOn(versions, date('2026-10-20'))?.targets.calories).toBe(2500);
		expect(goalsOn(versions, date('2026-09-30'))).toBeUndefined();
	});

	it('reject negative targets', () => {
		expect(
			expectErr(
				createDailyGoals({ targets: macros(-5, 0, 0, 0), effectiveFrom: date('2026-10-01') })
			)
		).toBeInstanceOf(InvalidMacros);
	});
});

describe('summarizeDay', () => {
	const oats = aFood('Oats')
		.per(100, 'g')
		.with(macros(400, 20, 60, 10))
		.build();
	const entries = [expectOk(logFood(oats, 100, placement)), expectOk(logFood(oats, 50, placement))];

	it('totals the day and shows what remains', () => {
		const goals = expectOk(
			createDailyGoals({ targets: macros(2000, 150, 250, 70), effectiveFrom: date('2026-10-01') })
		);

		expect(summarizeDay(entries, goals)).toEqual({
			eaten: macros(600, 30, 90, 15),
			targets: macros(2000, 150, 250, 70),
			remaining: macros(1400, 120, 160, 55)
		});
	});

	it('has no remaining amounts without goals', () => {
		expect(summarizeDay(entries, undefined).remaining).toBeUndefined();
	});
});

describe('mealSlotAt', () => {
	it.each([
		[7, MealSlot.breakfast],
		[12, MealSlot.lunch],
		[18, MealSlot.dinner],
		[22, MealSlot.snacks]
	])('suggests the slot for %d o’clock', (hour, slot) => {
		expect(mealSlotAt(hour)).toBe(slot);
	});
});
