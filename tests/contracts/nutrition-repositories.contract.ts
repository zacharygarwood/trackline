import { describe, expect, it } from 'vitest';
import { createDailyGoals } from '../../src/lib/nutrition/domain/daily-goals.ts';
import { logFood } from '../../src/lib/nutrition/domain/food-log-entry.ts';
import type { Food } from '../../src/lib/nutrition/domain/food.ts';
import { MealSlot } from '../../src/lib/nutrition/domain/meal-slot.constants.ts';
import type {
	DailyGoalsReader,
	DailyGoalsWriter,
	FoodLogReader,
	FoodLogWriter,
	FoodReader,
	FoodWriter,
	SavedMealReader,
	SavedMealWriter
} from '../../src/lib/nutrition/domain/nutrition-repositories.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { aFood, macros } from '../builders/nutrition.builder.ts';
import { anId } from '../builders/training.builder.ts';
import { expectOk } from '../support/result.ts';

/** Repositories that store nutrition data, sharing one database. */
export interface NutritionRepositories {
	readonly foods: FoodReader & FoodWriter;
	readonly meals: SavedMealReader & SavedMealWriter;
	readonly log: FoodLogReader & FoodLogWriter;
	readonly goals: DailyGoalsReader & DailyGoalsWriter;
}

const date = (text: string) => expectOk(LocalDate.parse(text));

function entry(food: Food, day: string, amount: number, loggedAt: number) {
	return expectOk(
		logFood(food, amount, { id: anId(), date: date(day), slot: MealSlot.lunch, loggedAt })
	);
}

/** The behavior every nutrition repository must have, for the fakes and for SQLite. */
export function describeNutritionRepositories(create: () => Promise<NutritionRepositories>): void {
	describe('nutrition repository contract', () => {
		it('round-trips a food and lists recently logged foods first', async () => {
			const repositories = await create();
			const oats = aFood('Oats').build();
			const bread = aFood('Bread')
				.per(1, 'slice')
				.with(macros(80, 3, 15, 1))
				.build();
			const apple = aFood('Apple').build();
			for (const food of [oats, bread, apple]) await repositories.foods.save(food);
			await repositories.log.save([
				entry(oats, '2026-10-26', 50, 1),
				entry(bread, '2026-10-27', 2, 2)
			]);

			expect(await repositories.foods.findById(bread.id)).toEqual(bread);
			expect((await repositories.foods.findAll()).map((food) => food.name)).toEqual([
				'Bread',
				'Oats',
				'Apple'
			]);
		});

		it('hides a deleted food from the list but still finds it, even after an edit', async () => {
			const repositories = await create();
			const oats = aFood('Oats').build();
			const apple = aFood('Apple').build();
			for (const food of [oats, apple]) await repositories.foods.save(food);
			await repositories.log.save([entry(oats, '2026-10-26', 50, 1)]);

			await repositories.foods.archive(oats.id);
			await repositories.foods.save({ ...oats, name: 'Rolled oats' });

			expect((await repositories.foods.findAll()).map((food) => food.name)).toEqual(['Apple']);
			expect((await repositories.foods.findById(oats.id))?.name).toBe('Rolled oats');
		});

		it('lists a day of the log in order and finds the last entry for a food', async () => {
			const repositories = await create();
			const oats = aFood('Oats').build();
			await repositories.foods.save(oats);
			const first = entry(oats, '2026-10-27', 40, 10);
			const second = entry(oats, '2026-10-27', 60, 20);
			await repositories.log.save([second, first, entry(oats, '2026-10-26', 30, 5)]);

			expect(await repositories.log.findByDate(date('2026-10-27'))).toEqual([first, second]);
			expect(await repositories.log.findById(first.id)).toEqual(first);
			expect((await repositories.log.findLastFor(oats.id))?.amount).toBe(60);

			await repositories.log.delete(first.id);
			expect(await repositories.log.findByDate(date('2026-10-27'))).toEqual([second]);
		});

		it('saves, lists, and deletes saved meals', async () => {
			const repositories = await create();
			const oats = aFood('Oats').build();
			await repositories.foods.save(oats);
			const meal = {
				id: anId<'SavedMeal'>(),
				name: 'Usual breakfast',
				items: [{ foodId: oats.id, amount: 60 }]
			};

			await repositories.meals.save(meal);
			expect(await repositories.meals.findAll()).toEqual([meal]);
			expect(await repositories.meals.findById(meal.id)).toEqual(meal);

			await repositories.meals.delete(meal.id);
			expect(await repositories.meals.findAll()).toEqual([]);
		});

		it('keeps one goals version per start date', async () => {
			const repositories = await create();
			const version = (calories: number) =>
				expectOk(
					createDailyGoals({
						targets: macros(calories, 150, 200, 70),
						effectiveFrom: date('2026-10-01')
					})
				);

			await repositories.goals.save(version(2000));
			await repositories.goals.save(version(2200));

			expect(await repositories.goals.findAll()).toEqual([version(2200)]);
		});
	});
}
