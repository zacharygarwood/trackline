import { describe, expect, it } from 'vitest';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { StaticFoodDatabase } from './static-food-database.ts';

const file = {
	source: 'USDA',
	nutrients: ['calories', 'protein', 'sugar'],
	foods: [
		['1', 'Milk, whole', [61, 3.2, null], [['1 cup', 244]]],
		['2', 'Cereals, oats, regular and quick, not fortified, dry', [379, 13.2, 1], []]
	]
};

describe('StaticFoodDatabase', () => {
	it('reads foods per 100 g with their portions, leaving out missing numbers', async () => {
		const database = new StaticFoodDatabase(() => Promise.resolve(file));

		expect(await database.findById('1')).toEqual({
			id: '1',
			name: 'Milk, whole',
			per100g: new Map([
				[aKey('calories'), 61],
				[aKey('protein'), 3.2]
			]),
			portions: [{ label: '1 cup', grams: 244 }]
		});
		expect((await database.search('oats')).map((food) => food.id)).toEqual(['2']);
	});

	it('loads the file once, and again only after a failed load', async () => {
		let loads = 0;
		const database = new StaticFoodDatabase(() => {
			loads += 1;
			return loads === 1 ? Promise.reject(new Error('offline')) : Promise.resolve(file);
		});

		expect(await database.search('milk')).toEqual([]);
		await database.search('milk');
		await database.findById('1');

		expect(loads).toBe(2);
	});

	it('skips foods that are malformed, and reads a malformed file as empty', async () => {
		const broken = { ...file, foods: [['1', 'Milk', ['x'], []], ...file.foods.slice(1)] };

		expect(
			await new StaticFoodDatabase(() => Promise.resolve(broken)).findById('1')
		).toBeUndefined();
		expect(await new StaticFoodDatabase(() => Promise.resolve(broken)).findById('2')).toBeDefined();
		expect(await new StaticFoodDatabase(() => Promise.resolve('nope')).search('milk')).toEqual([]);
	});
});
