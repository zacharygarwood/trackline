import { isFieldKey, type FieldKey } from '../domain/field.ts';
import {
	matchFoods,
	type DatabaseFood,
	type FoodDatabase,
	type Portion
} from '../domain/food-database.ts';

const SEARCH_RESULTS = 25;

type Json = Readonly<Record<string, unknown>>;

function isJson(value: unknown): value is Json {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function listOf(value: unknown): readonly unknown[] {
	return Array.isArray(value) ? value : [];
}

function portionOf(raw: unknown): Portion | undefined {
	const [label, grams] = listOf(raw);
	return typeof label === 'string' && typeof grams === 'number' && grams > 0
		? { label, grams }
		: undefined;
}

function numbersOf(
	nutrients: readonly FieldKey[],
	raw: unknown
): ReadonlyMap<FieldKey, number> | undefined {
	const amounts = listOf(raw);
	if (amounts.length !== nutrients.length) return undefined;
	const per100g = new Map<FieldKey, number>();
	for (const [index, key] of nutrients.entries()) {
		const amount = amounts.at(index);
		if (typeof amount === 'number') per100g.set(key, amount);
		else if (amount !== null) return undefined;
	}
	return per100g;
}

function foodOf(nutrients: readonly FieldKey[], raw: unknown): DatabaseFood | undefined {
	const [id, name, amounts, portions] = listOf(raw);
	const per100g = numbersOf(nutrients, amounts);
	if (typeof id !== 'string' || typeof name !== 'string' || per100g === undefined) return undefined;
	const checked = listOf(portions).flatMap((item) => {
		const portion = portionOf(item);
		return portion === undefined ? [] : [portion];
	});
	return { id, name, per100g, portions: checked };
}

/**
 * The foods in the database file, skipping any that are malformed; none if
 * the file itself is malformed.
 *
 * @param file - The parsed JSON file.
 */
function foodsOf(file: unknown): readonly DatabaseFood[] {
	if (!isJson(file)) return [];
	const nutrients = listOf(file.nutrients).filter(
		(key): key is FieldKey => typeof key === 'string' && isFieldKey(key)
	);
	return listOf(file.foods).flatMap((raw) => {
		const food = foodOf(nutrients, raw);
		return food === undefined ? [] : [food];
	});
}

/**
 * The built-in food database, read from a static JSON file the first time it
 * is searched and kept in memory after that. A failed load finds nothing and
 * is tried again on the next search.
 */
export class StaticFoodDatabase implements FoodDatabase {
	private loaded: Promise<readonly DatabaseFood[]> | undefined;

	/** @param load - Reads the database file from the app's own origin. */
	constructor(private readonly load: () => Promise<unknown>) {}

	private async foods(): Promise<readonly DatabaseFood[]> {
		this.loaded ??= this.load().then(foodsOf);
		try {
			return await this.loaded;
		} catch {
			this.loaded = undefined;
			return [];
		}
	}

	/** @param text - What was typed. */
	async search(text: string): Promise<readonly DatabaseFood[]> {
		return matchFoods(await this.foods(), text, SEARCH_RESULTS);
	}

	/** @param id - The food's id. */
	async findById(id: string): Promise<DatabaseFood | undefined> {
		return (await this.foods()).find((food) => food.id === id);
	}
}
