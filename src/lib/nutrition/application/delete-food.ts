import type { FoodId } from '../domain/ids.ts';
import type { Foods } from './nutrition-ports.ts';

/** Which food to delete. */
export interface DeleteFoodCommand {
	readonly id: FoodId;
}

/** Removes a food from the library; the days it was logged keep their entries. */
export class DeleteFood {
	constructor(private readonly foods: Foods) {}

	/** @param command - The food. */
	async execute(command: DeleteFoodCommand): Promise<void> {
		await this.foods.archive(command.id);
	}
}
