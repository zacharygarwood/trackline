import type { FoodReader } from '../domain/nutrition-repositories.ts';
import type { Food } from '../domain/food.ts';

/** Lists the food library, recently logged foods first. */
export class ListFoods {
	constructor(private readonly foods: FoodReader) {}

	/** @returns Every food, most recently logged first. */
	execute(): Promise<readonly Food[]> {
		return this.foods.findAll();
	}
}
