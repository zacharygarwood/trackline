import type { SearchFoods } from '../application/food-database.ts';
import type { DatabaseFood } from '../domain/food-database.ts';

const MIN_LETTERS = 2;

/** State of food search in the built-in food database, as a person types. */
export class FoodSearch {
	found: readonly DatabaseFood[] = $state([]);
	private asked = 0;

	constructor(private readonly searchFoods: SearchFoods) {}

	/**
	 * Searches for the typed text once it has two letters, keeping only the
	 * answer to the latest text when answers arrive out of order.
	 *
	 * @param text - What was typed.
	 */
	async find(text: string): Promise<void> {
		this.asked += 1;
		const asked = this.asked;
		const typed = text.trim();
		const found = typed.length < MIN_LETTERS ? [] : await this.searchFoods.execute({ text: typed });
		if (asked === this.asked) this.found = found;
	}
}
