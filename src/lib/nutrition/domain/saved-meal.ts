import { err, ok, type Result } from '../../shared/result.ts';
import type { FoodId, SavedMealId } from './ids.ts';
import { parseName, type InvalidName } from './name.ts';
import { InvalidAmount, isAmount } from './portion.ts';

/** A food in a saved meal and its default amount. */
export interface SavedMealItem {
	readonly foodId: FoodId;
	readonly amount: number;
}

/** A named group of foods logged together in one tap, such as "Usual breakfast". */
export interface SavedMeal {
	readonly id: SavedMealId;
	readonly name: string;
	readonly items: readonly SavedMealItem[];
}

/** Raised when a saved meal has no foods. */
export class EmptyMeal {}

/** Why a saved meal is invalid. */
export type SavedMealProblem = InvalidName | EmptyMeal | InvalidAmount;

/**
 * Creates a saved meal with at least one food.
 *
 * @param fields - The meal's id, name, and foods.
 */
export function createSavedMeal(fields: SavedMeal): Result<SavedMeal, SavedMealProblem> {
	const name = parseName(fields.name);
	if (!name.ok) return name;
	if (fields.items.length === 0) return err(new EmptyMeal());
	const invalid = fields.items.find((item) => !isAmount(item.amount));
	if (invalid !== undefined) return err(new InvalidAmount(invalid.amount));
	return ok({ ...fields, name: name.value });
}
