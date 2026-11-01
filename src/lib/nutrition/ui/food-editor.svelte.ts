import type { DeleteFood } from '../application/delete-food.ts';
import type { UpdateFood } from '../application/update-food.ts';
import type { Food } from '../domain/food.ts';
import { NewFoodForm } from './new-food-form.svelte.ts';

/** The use cases the food editor calls. */
export interface FoodEditorUseCases {
	readonly updateFood: UpdateFood;
	readonly deleteFood: DeleteFood;
}

/** State and actions of a food's edit page: its name, portion, and macros. */
export class FoodEditor {
	name: string = $state('');
	readonly form = new NewFoodForm();

	constructor(
		private readonly useCases: FoodEditorUseCases,
		private readonly food: Food
	) {
		this.name = food.name;
		this.form.fill(food);
	}

	/**
	 * Saves the changes. Carbs and fat stay as they were when they are not tracked.
	 *
	 * @param trackCarbsAndFat - Whether the form asked for carbs and fat.
	 * @returns The saved food, or undefined if something was invalid.
	 */
	async save(trackCarbsAndFat: boolean): Promise<Food | undefined> {
		const command = this.form.toCommand(this.name, trackCarbsAndFat, this.food.reference.unit);
		const kept = this.food.macrosPerReference;
		const result = await this.useCases.updateFood.execute({
			...command,
			id: this.food.id,
			macrosPerReference: trackCarbsAndFat
				? command.macrosPerReference
				: { ...command.macrosPerReference, carbs: kept.carbs, fat: kept.fat }
		});
		return result.ok ? result.value : undefined;
	}

	/** Removes the food from the library. */
	async delete(): Promise<void> {
		await this.useCases.deleteFood.execute({ id: this.food.id });
	}
}
