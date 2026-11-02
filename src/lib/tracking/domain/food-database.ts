import type { Field, FieldKey, FieldValue } from './field.ts';
import { FieldType } from './tracking.constants.ts';

const GRAMS_PER_LISTING = 100;

/** A household serving of a database food and its weight, such as "1 cup" of 81 g. */
export interface Portion {
	readonly label: string;
	readonly grams: number;
}

/** A food from the built-in food database: its numbers per 100 g, by the field key they fill. */
export interface DatabaseFood {
	readonly id: string;
	readonly name: string;
	readonly per100g: ReadonlyMap<FieldKey, number>;
	readonly portions: readonly Portion[];
}

/** The built-in, read-only food database. */
export interface FoodDatabase {
	/**
	 * The foods whose names have every typed word, best first.
	 *
	 * @param text - What was typed.
	 */
	search(text: string): Promise<readonly DatabaseFood[]>;
	/**
	 * One food, or undefined if there is none with that id.
	 *
	 * @param id - The food's id.
	 */
	findById(id: string): Promise<DatabaseFood | undefined>;
}

function wordsOf(text: string): readonly string[] {
	return text
		.toLowerCase()
		.split(/[\s,]+/)
		.filter((word) => word !== '');
}

function rank(food: DatabaseFood, firstWord: string): readonly [number, number] {
	return [food.name.toLowerCase().startsWith(firstWord) ? 0 : 1, food.name.length];
}

/**
 * The foods whose names have every typed word, in any order and case: names
 * that start with the first word first, then shorter, plainer names.
 *
 * @param foods - Every food.
 * @param text - What was typed.
 * @param limit - The most to return.
 */
export function matchFoods(
	foods: readonly DatabaseFood[],
	text: string,
	limit: number
): readonly DatabaseFood[] {
	const words = wordsOf(text);
	const [firstWord] = words;
	if (firstWord === undefined) return [];
	return foods
		.filter((food) => {
			const name = food.name.toLowerCase();
			return words.every((word) => name.includes(word));
		})
		.map((food) => ({ food, rank: rank(food, firstWord) }))
		.sort((one, other) => {
			const [oneStart, oneLength] = one.rank;
			const [otherStart, otherLength] = other.rank;
			return oneStart === otherStart ? oneLength - otherLength : oneStart - otherStart;
		})
		.slice(0, limit)
		.map(({ food }) => food);
}

/**
 * A database food's numbers for one serving, for the tracker's number fields
 * it has numbers for, such as calories and protein.
 *
 * @param food - The database food.
 * @param grams - How much a serving weighs.
 * @param fields - The food tracker's fields.
 */
export function servingValues(
	food: DatabaseFood,
	grams: number,
	fields: readonly Field[]
): ReadonlyMap<FieldKey, FieldValue> {
	const values = new Map<FieldKey, FieldValue>();
	for (const field of fields) {
		const per100g = food.per100g.get(field.key);
		if (field.type === FieldType.number && per100g !== undefined)
			values.set(field.key, {
				type: FieldType.number,
				amount: (per100g * grams) / GRAMS_PER_LISTING
			});
	}
	return values;
}
