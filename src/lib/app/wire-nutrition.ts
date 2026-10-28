import { ChangeLogAmount } from '../nutrition/application/change-log-amount.ts';
import { CreateFood } from '../nutrition/application/create-food.ts';
import { DeleteLogEntry } from '../nutrition/application/delete-log-entry.ts';
import { DeleteSavedMeal } from '../nutrition/application/delete-saved-meal.ts';
import { GetDailyGoals } from '../nutrition/application/get-daily-goals.ts';
import { GetDayNutrition } from '../nutrition/application/get-day-nutrition.ts';
import { GetLastAmount } from '../nutrition/application/get-last-amount.ts';
import { ListFoods } from '../nutrition/application/list-foods.ts';
import { ListSavedMeals } from '../nutrition/application/list-saved-meals.ts';
import { LogFood } from '../nutrition/application/log-food.ts';
import { LogSavedMeal } from '../nutrition/application/log-saved-meal.ts';
import { SaveMealFromSlot } from '../nutrition/application/save-meal-from-slot.ts';
import { SetDailyGoals } from '../nutrition/application/set-daily-goals.ts';
import {
	SqliteDailyGoalsRepository,
	SqliteFoodLogRepository,
	SqliteFoodRepository,
	SqliteSavedMealRepository
} from '../nutrition/infrastructure/sqlite-nutrition-repositories.ts';
import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import type { Infrastructure } from './infrastructure.ts';

/**
 * Wires the Nutrition context: foods, the food log, saved meals, and daily goals.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireNutrition(infrastructure: Infrastructure) {
	const { database, clock } = infrastructure;
	const ids = new UuidV7IdGenerator(clock);
	const foods = new SqliteFoodRepository(database);
	const meals = new SqliteSavedMealRepository(database);
	const log = new SqliteFoodLogRepository(database);
	const goals = new SqliteDailyGoalsRepository(database);
	return {
		createFood: new CreateFood(foods, ids),
		listFoods: new ListFoods(foods),
		logFood: new LogFood({ foods, log, clock, ids }),
		changeLogAmount: new ChangeLogAmount(log),
		deleteLogEntry: new DeleteLogEntry(log),
		getDayNutrition: new GetDayNutrition(log, goals),
		getLastAmount: new GetLastAmount(log),
		saveMealFromSlot: new SaveMealFromSlot({ log, meals, ids }),
		listSavedMeals: new ListSavedMeals(meals),
		deleteSavedMeal: new DeleteSavedMeal(meals),
		logSavedMeal: new LogSavedMeal({ meals, foods, log, clock, ids }),
		setDailyGoals: new SetDailyGoals(goals, clock),
		getDailyGoals: new GetDailyGoals(goals)
	};
}
