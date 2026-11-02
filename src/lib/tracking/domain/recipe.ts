import { err, ok, type Result } from '../../shared/result.ts';
import { MAX_NUMBER, type FieldKey, type FieldValue } from './field.ts';
import type { SubjectId } from './ids.ts';
import { FieldType, RecipeProblem } from './tracking.constants.ts';

/** A food in a recipe and how many of its servings go in. */
export interface Ingredient {
	readonly foodId: SubjectId;
	readonly servings: number;
}

/** A food made of other foods from the same library, such as porridge from oats and milk. */
export interface Recipe {
	readonly ingredients: readonly Ingredient[];
	/** How many servings the whole recipe makes. */
	readonly servings: number;
}

/** What a recipe reads from a food in the library: which one it is and its numbers per serving. */
export interface RecipeFood {
	readonly id: SubjectId;
	readonly defaults: ReadonlyMap<FieldKey, FieldValue>;
}

/** Raised when a recipe's numbers cannot be worked out. */
export class InvalidRecipe {
	/** @param problem - What was wrong. */
	constructor(readonly problem: RecipeProblem) {}
}

function isAmount(amount: number): boolean {
	return Number.isFinite(amount) && amount > 0 && amount <= MAX_NUMBER;
}

function addInto(totals: Map<FieldKey, number>, food: RecipeFood, servings: number): void {
	for (const [key, value] of food.defaults) {
		if (value.type === FieldType.number)
			totals.set(key, (totals.get(key) ?? 0) + value.amount * servings);
	}
}

/**
 * A recipe's numbers per serving, such as its calories: each ingredient's
 * numbers per serving times the servings that go in, added up, then divided
 * by the servings the recipe makes. They are worked out when the recipe is
 * saved, so it logs like any other food.
 *
 * @param recipe - The recipe.
 * @param foods - The library its ingredients come from.
 */
export function perServingOf(
	recipe: Recipe,
	foods: readonly RecipeFood[]
): Result<ReadonlyMap<FieldKey, FieldValue>, InvalidRecipe> {
	const { ingredients, servings } = recipe;
	if (ingredients.length === 0) return err(new InvalidRecipe(RecipeProblem.ingredients));
	if (!isAmount(servings) || !ingredients.every((item) => isAmount(item.servings)))
		return err(new InvalidRecipe(RecipeProblem.amount));
	const totals = new Map<FieldKey, number>();
	for (const ingredient of ingredients) {
		const food = foods.find((candidate) => candidate.id === ingredient.foodId);
		if (food === undefined) return err(new InvalidRecipe(RecipeProblem.ingredients));
		addInto(totals, food, ingredient.servings);
	}
	return ok(
		new Map(
			[...totals].map(([key, total]) => [key, { type: FieldType.number, amount: total / servings }])
		)
	);
}
