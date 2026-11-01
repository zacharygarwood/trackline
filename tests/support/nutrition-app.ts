import { ChangeLogAmount } from '../../src/lib/nutrition/application/change-log-amount.ts';
import { CreateFood } from '../../src/lib/nutrition/application/create-food.ts';
import { DeleteFood } from '../../src/lib/nutrition/application/delete-food.ts';
import { DeleteLogEntry } from '../../src/lib/nutrition/application/delete-log-entry.ts';
import { RestoreLogEntry } from '../../src/lib/nutrition/application/restore-log-entry.ts';
import { DeleteSavedMeal } from '../../src/lib/nutrition/application/delete-saved-meal.ts';
import { GetDailyGoals } from '../../src/lib/nutrition/application/get-daily-goals.ts';
import { GetDayNutrition } from '../../src/lib/nutrition/application/get-day-nutrition.ts';
import { GetLastAmount } from '../../src/lib/nutrition/application/get-last-amount.ts';
import { ListFoods } from '../../src/lib/nutrition/application/list-foods.ts';
import { ListSavedMeals } from '../../src/lib/nutrition/application/list-saved-meals.ts';
import { LogFood } from '../../src/lib/nutrition/application/log-food.ts';
import { LogSavedMeal } from '../../src/lib/nutrition/application/log-saved-meal.ts';
import { SaveMealFromSlot } from '../../src/lib/nutrition/application/save-meal-from-slot.ts';
import { SetDailyGoals } from '../../src/lib/nutrition/application/set-daily-goals.ts';
import { UpdateFood } from '../../src/lib/nutrition/application/update-food.ts';
import { FixedClock } from '../fakes/fixed-clock.ts';
import {
	InMemoryDailyGoals,
	InMemoryFoodLog,
	InMemoryFoods,
	InMemorySavedMeals
} from '../fakes/in-memory-nutrition-repositories.ts';
import { SequentialIdGenerator } from '../fakes/sequential-id-generator.ts';

/** Every nutrition use case wired to in-memory fakes and a fixed clock. */
export function nutritionApp(clock = new FixedClock(Date.UTC(2026, 9, 27, 12), '2026-10-27')) {
	const ids = new SequentialIdGenerator();
	const log = new InMemoryFoodLog();
	const foods = new InMemoryFoods(log);
	const meals = new InMemorySavedMeals();
	const goals = new InMemoryDailyGoals();
	return {
		clock,
		createFood: new CreateFood(foods, ids),
		updateFood: new UpdateFood(foods),
		deleteFood: new DeleteFood(foods),
		listFoods: new ListFoods(foods),
		logFood: new LogFood({ foods, log, clock, ids }),
		changeLogAmount: new ChangeLogAmount(log),
		deleteLogEntry: new DeleteLogEntry(log),
		restoreLogEntry: new RestoreLogEntry(log),
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
