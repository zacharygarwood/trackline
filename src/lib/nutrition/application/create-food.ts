import type { IdGenerator } from '../../shared/id-generator.ts';
import type { Result } from '../../shared/result.ts';
import { createFood, type Food, type FoodProblem } from '../domain/food.ts';
import type { Macros } from '../domain/macros.ts';
import type { Portion } from '../domain/portion.ts';
import type { Foods } from './nutrition-ports.ts';

/** A new food as entered: its name, reference portion, and macros for that portion. */
export interface CreateFoodCommand {
	readonly name: string;
	readonly reference: Portion;
	readonly macrosPerReference: Macros;
}

/** Adds a food to the library. */
export class CreateFood {
	constructor(
		private readonly foods: Foods,
		private readonly ids: IdGenerator
	) {}

	/** @param command - The food as entered. */
	async execute(command: CreateFoodCommand): Promise<Result<Food, FoodProblem>> {
		const food = createFood({ id: this.ids.next(), ...command });
		if (food.ok) await this.foods.save(food.value);
		return food;
	}
}
