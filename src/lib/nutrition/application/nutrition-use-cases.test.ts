import { describe, expect, it } from 'vitest';
import { macros } from '../../../../tests/builders/nutrition.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { nutritionApp } from '../../../../tests/support/nutrition-app.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { MealSlot } from '../domain/meal-slot.constants.ts';
import { InvalidName } from '../domain/name.ts';
import { InvalidAmount } from '../domain/portion.ts';
import { EmptyMeal } from '../domain/saved-meal.ts';
import { NotFound } from './nutrition-ports.ts';

async function withOats(app: ReturnType<typeof nutritionApp>) {
	return expectOk(
		await app.createFood.execute({
			name: 'Oats',
			reference: { amount: 100, unit: 'g' },
			macrosPerReference: macros(400, 20, 60, 10)
		})
	);
}

describe('foods and the log', () => {
	it('creates a food and logs a scaled amount of it', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);

		const entry = expectOk(
			await app.logFood.execute({
				foodId: oats.id,
				amount: 150,
				date: app.clock.today(),
				slot: MealSlot.breakfast
			})
		);

		expect(entry.macrosSnapshot).toEqual(macros(600, 30, 90, 15));
		expect(await app.getLastAmount.execute({ foodId: oats.id })).toBe(150);
	});

	it('rejects an invalid food and a zero amount', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);

		const unnamed = await app.createFood.execute({
			name: '',
			reference: { amount: 1, unit: 'g' },
			macrosPerReference: macros(0, 0, 0, 0)
		});
		const nothing = await app.logFood.execute({
			foodId: oats.id,
			amount: 0,
			date: app.clock.today(),
			slot: MealSlot.lunch
		});

		expect(expectErr(unnamed)).toBeInstanceOf(InvalidName);
		expect(expectErr(nothing)).toBeInstanceOf(InvalidAmount);
	});

	it('refuses to log a food that does not exist', async () => {
		const app = nutritionApp();

		const result = await app.logFood.execute({
			foodId: anId(),
			amount: 1,
			date: app.clock.today(),
			slot: MealSlot.lunch
		});

		expect(expectErr(result)).toBeInstanceOf(NotFound);
	});

	it('adjusts and removes entries', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		const entry = expectOk(
			await app.logFood.execute({
				foodId: oats.id,
				amount: 100,
				date: app.clock.today(),
				slot: MealSlot.lunch
			})
		);

		const changed = expectOk(await app.changeLogAmount.execute({ id: entry.id, amount: 50 }));
		expect(changed.macrosSnapshot).toEqual(macros(200, 10, 30, 5));
		expect(expectErr(await app.changeLogAmount.execute({ id: anId(), amount: 1 }))).toBeInstanceOf(
			NotFound
		);

		await app.deleteLogEntry.execute({ id: entry.id });
		expect((await app.getDayNutrition.execute({ date: app.clock.today() })).entries).toEqual([]);

		await app.restoreLogEntry.execute({ entry: changed });
		expect((await app.getDayNutrition.execute({ date: app.clock.today() })).entries).toEqual([
			changed
		]);
	});

	it('lists foods most recently logged first', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		const apple = expectOk(
			await app.createFood.execute({
				name: 'Apple',
				reference: { amount: 1, unit: 'apple' },
				macrosPerReference: macros(95, 0, 25, 0)
			})
		);
		await app.logFood.execute({
			foodId: oats.id,
			amount: 50,
			date: app.clock.today(),
			slot: MealSlot.lunch
		});

		expect((await app.listFoods.execute()).map((food) => food.id)).toEqual([oats.id, apple.id]);
	});
});

describe('daily goals and the day summary', () => {
	it('compares the day with the goals set today', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		expectOk(await app.setDailyGoals.execute({ targets: macros(2000, 150, 250, 70) }));
		await app.logFood.execute({
			foodId: oats.id,
			amount: 100,
			date: app.clock.today(),
			slot: MealSlot.lunch
		});

		const day = await app.getDayNutrition.execute({ date: app.clock.today() });

		expect(day.summary.remaining).toEqual(macros(1600, 130, 190, 60));
		expect((await app.getDailyGoals.execute({ date: app.clock.today() }))?.targets.calories).toBe(
			2000
		);
	});

	it('keeps judging earlier days against their own goals', async () => {
		const app = nutritionApp();
		await app.setDailyGoals.execute({ targets: macros(2000, 150, 250, 70) });
		const yesterday = app.clock.today();
		app.clock.setToday('2026-10-28');

		await app.setDailyGoals.execute({ targets: macros(2400, 180, 280, 80) });

		expect((await app.getDailyGoals.execute({ date: yesterday }))?.targets.calories).toBe(2000);
		expect((await app.getDailyGoals.execute({ date: app.clock.today() }))?.targets.calories).toBe(
			2400
		);
	});
});

describe('saved meals', () => {
	it('saves a meal slot and logs it again in one step', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		await app.logFood.execute({
			foodId: oats.id,
			amount: 60,
			date: app.clock.today(),
			slot: MealSlot.breakfast
		});
		const meal = expectOk(
			await app.saveMealFromSlot.execute({
				date: app.clock.today(),
				slot: MealSlot.breakfast,
				name: 'Usual breakfast'
			})
		);
		app.clock.setToday('2026-10-28');

		const entries = expectOk(
			await app.logSavedMeal.execute({
				mealId: meal.id,
				date: app.clock.today(),
				slot: MealSlot.breakfast
			})
		);

		expect(entries.map((entry) => entry.amount)).toEqual([60]);
		expect((await app.listSavedMeals.execute()).map((saved) => saved.name)).toEqual([
			'Usual breakfast'
		]);
	});

	it('refuses to save an empty slot and to log a deleted meal', async () => {
		const app = nutritionApp();
		const empty = await app.saveMealFromSlot.execute({
			date: app.clock.today(),
			slot: MealSlot.dinner,
			name: 'Dinner'
		});
		expect(expectErr(empty)).toBeInstanceOf(EmptyMeal);

		const oats = await withOats(app);
		await app.logFood.execute({
			foodId: oats.id,
			amount: 60,
			date: app.clock.today(),
			slot: MealSlot.dinner
		});
		const meal = expectOk(
			await app.saveMealFromSlot.execute({
				date: app.clock.today(),
				slot: MealSlot.dinner,
				name: 'Dinner'
			})
		);
		await app.deleteSavedMeal.execute({ id: meal.id });

		const logged = await app.logSavedMeal.execute({
			mealId: meal.id,
			date: app.clock.today(),
			slot: MealSlot.dinner
		});
		expect(expectErr(logged)).toBeInstanceOf(NotFound);
	});
});
