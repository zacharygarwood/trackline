import { describe, expect, it } from 'vitest';
import {
	DATABASE_OATS,
	InMemoryFoodDatabase
} from '../../../../tests/fakes/in-memory-food-database.ts';
import { SearchFoods } from '../application/food-database.ts';
import type { DatabaseFood, FoodDatabase } from '../domain/food-database.ts';
import { FoodSearch } from './food-search.svelte.ts';

describe('FoodSearch', () => {
	it('searches the food database once two letters are typed', async () => {
		const search = new FoodSearch(new SearchFoods(new InMemoryFoodDatabase()));

		await search.find('o');
		expect(search.found).toEqual([]);
		await search.find(' oa ');
		expect(search.found).toEqual([DATABASE_OATS]);
		await search.find('');
		expect(search.found).toEqual([]);
	});

	it('keeps only the answer to the latest text typed', async () => {
		const answers: ((foods: readonly DatabaseFood[]) => void)[] = [];
		const slow: FoodDatabase = {
			search: () =>
				new Promise((resolve) => {
					answers.push(resolve);
				}),
			findById: () => Promise.resolve(undefined)
		};
		const search = new FoodSearch(new SearchFoods(slow));

		const first = search.find('oats');
		const second = search.find('milk');
		const [answerFirst, answerSecond] = answers;
		answerSecond?.([]);
		answerFirst?.([DATABASE_OATS]);
		await Promise.all([first, second]);

		expect(search.found).toEqual([]);
	});
});
