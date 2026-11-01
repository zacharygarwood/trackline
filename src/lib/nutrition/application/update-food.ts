import { err, type Result } from '../../shared/result.ts';
import { createFood, type Food, type FoodProblem } from '../domain/food.ts';
import type { FoodId } from '../domain/ids.ts';
import type { Macros } from '../domain/macros.ts';
import type { Portion } from '../domain/portion.ts';
import { NotFound, type Foods } from './nutrition-ports.ts';

/** A food's new name, reference portion, and macros for that portion. */
export interface UpdateFoodCommand {
	readonly id: FoodId;
	readonly name: string;
	readonly reference: Portion;
	readonly macrosPerReference: Macros;
}

/** Changes a food in the library; entries already logged keep the values they were logged with. */
export class UpdateFood {
	constructor(private readonly foods: Foods) {}

	/** @param command - The food and its new values. */
	async execute(command: UpdateFoodCommand): Promise<Result<Food, FoodProblem | NotFound>> {
		if ((await this.foods.findById(command.id)) === undefined) return err(new NotFound(command.id));
		const food = createFood(command);
		if (food.ok) await this.foods.save(food.value);
		return food;
	}
}
