import { describe, expect, it } from 'vitest';
import { aFood, macros } from '../../../../tests/builders/nutrition.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { describeNutritionRepositories } from '../../../../tests/contracts/nutrition-repositories.contract.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { createDailyGoals } from '../domain/daily-goals.ts';
import { logFood } from '../domain/food-log-entry.ts';
import { MealSlot } from '../domain/meal-slot.constants.ts';
import {
	dailyGoalsMapper,
	foodLogEntryMapper,
	foodMapper,
	savedMealMapper
} from './nutrition.mapper.ts';
import {
	SqliteDailyGoalsRepository,
	SqliteFoodLogRepository,
	SqliteFoodRepository,
	SqliteSavedMealRepository
} from './sqlite-nutrition-repositories.ts';

describeNutritionRepositories(async () => {
	const database = await migratedDatabase();
	return {
		foods: new SqliteFoodRepository(database),
		meals: new SqliteSavedMealRepository(database),
		log: new SqliteFoodLogRepository(database),
		goals: new SqliteDailyGoalsRepository(database)
	};
});

describe('nutrition mappers', () => {
	const food = aFood('Bread')
		.per(1, 'slice')
		.with(macros(80, 3, 15, 1))
		.build();
	const date = expectOk(LocalDate.parse('2026-10-27'));

	it('round-trip every model', () => {
		const entry = expectOk(
			logFood(food, 2, { id: anId(), date, slot: MealSlot.snacks, loggedAt: 5 })
		);
		const meal = {
			id: anId<'SavedMeal'>(),
			name: 'Toast',
			items: [{ foodId: food.id, amount: 2 }]
		};
		const mealRows = savedMealMapper.toRows(meal);
		const goals = expectOk(
			createDailyGoals({ targets: macros(2000, 150, 200, 70), effectiveFrom: date })
		);

		expect(expectOk(foodMapper.toDomain(foodMapper.toRow(food)))).toEqual(food);
		expect(expectOk(foodLogEntryMapper.toDomain(foodLogEntryMapper.toRow(entry)))).toEqual(entry);
		expect(expectOk(savedMealMapper.toDomain(mealRows.meal, mealRows.items))).toEqual(meal);
		expect(expectOk(dailyGoalsMapper.toDomain(dailyGoalsMapper.toRow(goals)))).toEqual(goals);
	});

	it('reject corrupt rows', () => {
		const entryRow = foodLogEntryMapper.toRow(
			expectOk(logFood(food, 2, { id: anId(), date, slot: MealSlot.snacks, loggedAt: 5 }))
		);

		expect(
			expectErr(foodMapper.toDomain({ ...foodMapper.toRow(food), reference_amount: 0 }))
		).toBeInstanceOf(CorruptRow);
		expect(expectErr(foodLogEntryMapper.toDomain({ ...entryRow, slot: 'brunch' }))).toBeInstanceOf(
			CorruptRow
		);
		expect(
			expectErr(
				dailyGoalsMapper.toDomain({
					effective_from: 'soon',
					calories: 1,
					protein_g: 1,
					carbs_g: 1,
					fat_g: 1
				})
			)
		).toBeInstanceOf(CorruptRow);
		expect(expectErr(savedMealMapper.toDomain({ id: anId(), name: 'Empty' }, []))).toBeInstanceOf(
			CorruptRow
		);
	});
});
