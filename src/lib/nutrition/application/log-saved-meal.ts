import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { logFood, type FoodLogEntry } from '../domain/food-log-entry.ts';
import type { SavedMealId } from '../domain/ids.ts';
import type { MealSlot } from '../domain/meal-slot.constants.ts';
import type { FoodReader, SavedMealReader } from '../domain/nutrition-repositories.ts';
import type { InvalidAmount } from '../domain/portion.ts';
import { NotFound, type Creation, type FoodLog } from './nutrition-ports.ts';

/** Which meal, and when it was eaten. */
export interface LogSavedMealCommand {
	readonly mealId: SavedMealId;
	readonly date: LocalDate;
	readonly slot: MealSlot;
}

/** What logging a saved meal needs. */
export interface LogSavedMealPorts extends Creation {
	readonly meals: SavedMealReader;
	readonly foods: FoodReader;
	readonly log: FoodLog;
}

/** Logs every food of a saved meal at its default amount, all at once. */
export class LogSavedMeal {
	constructor(private readonly ports: LogSavedMealPorts) {}

	/** @param command - The meal, day, and slot. */
	async execute(
		command: LogSavedMealCommand
	): Promise<Result<readonly FoodLogEntry[], NotFound | InvalidAmount>> {
		const { meals, foods, log, clock, ids } = this.ports;
		const meal = await meals.findById(command.mealId);
		if (meal === undefined) return err(new NotFound(command.mealId));
		const entries: FoodLogEntry[] = [];
		for (const item of meal.items) {
			const food = await foods.findById(item.foodId);
			if (food === undefined) return err(new NotFound(item.foodId));
			const placement = {
				id: ids.next<'FoodLogEntry'>(),
				date: command.date,
				slot: command.slot,
				loggedAt: clock.now()
			};
			const entry = logFood(food, item.amount, placement);
			if (!entry.ok) return entry;
			entries.push(entry.value);
		}
		await log.save(entries);
		return ok(entries);
	}
}
