import type { SavedMealId } from '../domain/ids.ts';
import type { SavedMealWriter } from '../domain/nutrition-repositories.ts';

/** Which saved meal to delete. */
export interface DeleteSavedMealCommand {
	readonly id: SavedMealId;
}

/** Deletes a saved meal. Entries already logged from it stay. */
export class DeleteSavedMeal {
	constructor(private readonly meals: SavedMealWriter) {}

	/** @param command - The meal. */
	async execute(command: DeleteSavedMealCommand): Promise<void> {
		await this.meals.delete(command.id);
	}
}
