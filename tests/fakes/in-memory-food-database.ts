import {
	matchFoods,
	type DatabaseFood,
	type FoodDatabase
} from '../../src/lib/tracking/domain/food-database.ts';
import { aKey } from '../builders/tracking.builder.ts';

const RESULTS = 20;

/** Dry oats from the food database, for tests: per 100 g, with a 1 cup portion. */
export const DATABASE_OATS: DatabaseFood = {
	id: '173904',
	name: 'Cereals, oats, regular and quick, not fortified, dry',
	per100g: new Map([
		[aKey('calories'), 379],
		[aKey('protein'), 13.2],
		[aKey('sodium'), 6]
	]),
	portions: [{ label: '1 cup', grams: 81 }]
};

/** A food database held in memory, for tests. */
export class InMemoryFoodDatabase implements FoodDatabase {
	/** @param foods - The foods it has. */
	constructor(private readonly foods: readonly DatabaseFood[] = [DATABASE_OATS]) {}

	/** @param text - What was typed. */
	search(text: string): Promise<readonly DatabaseFood[]> {
		return Promise.resolve(matchFoods(this.foods, text, RESULTS));
	}

	/** @param id - The food's id. */
	findById(id: string): Promise<DatabaseFood | undefined> {
		return Promise.resolve(this.foods.find((food) => food.id === id));
	}
}
