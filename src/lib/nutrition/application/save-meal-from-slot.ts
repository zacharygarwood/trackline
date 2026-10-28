import type { IdGenerator } from '../../shared/id-generator.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { Result } from '../../shared/result.ts';
import type { MealSlot } from '../domain/meal-slot.constants.ts';
import type { FoodLogReader } from '../domain/nutrition-repositories.ts';
import { createSavedMeal, type SavedMeal, type SavedMealProblem } from '../domain/saved-meal.ts';
import type { SavedMeals } from './nutrition-ports.ts';

/** The day and slot to copy, and the meal's name. */
export interface SaveMealFromSlotCommand {
	readonly date: LocalDate;
	readonly slot: MealSlot;
	readonly name: string;
}

/** What saving a meal needs. */
export interface SaveMealPorts {
	readonly log: FoodLogReader;
	readonly meals: SavedMeals;
	readonly ids: IdGenerator;
}

/** Saves what was logged in one meal slot as a meal to log again in one tap. */
export class SaveMealFromSlot {
	constructor(private readonly ports: SaveMealPorts) {}

	/** @param command - The slot and name. */
	async execute(command: SaveMealFromSlotCommand): Promise<Result<SavedMeal, SavedMealProblem>> {
		const entries = (await this.ports.log.findByDate(command.date)).filter(
			(entry) => entry.slot === command.slot
		);
		const meal = createSavedMeal({
			id: this.ports.ids.next(),
			name: command.name,
			items: entries.map((entry) => ({ foodId: entry.foodId, amount: entry.amount }))
		});
		if (meal.ok) await this.ports.meals.save(meal.value);
		return meal;
	}
}
