import type { SavedMealReader } from '../domain/nutrition-repositories.ts';
import type { SavedMeal } from '../domain/saved-meal.ts';

/** Lists saved meals for the log-food sheet. */
export class ListSavedMeals {
	constructor(private readonly meals: SavedMealReader) {}

	/** @returns Every saved meal, by name. */
	execute(): Promise<readonly SavedMeal[]> {
		return this.meals.findAll();
	}
}
