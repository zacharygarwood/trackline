import { describe, expect, it } from 'vitest';
import { aKey, aNumberField, aTracker } from '../../../../tests/builders/tracking.builder.ts';
import { daysAWeek } from './goal-parts.ts';
import { matchFoods, servingValues, type DatabaseFood } from './food-database.ts';
import { FieldType } from './tracking.constants.ts';

function aDatabaseFood(
	name: string,
	per100g: readonly (readonly [string, number])[] = []
): DatabaseFood {
	return {
		id: name,
		name,
		per100g: new Map(per100g.map(([key, amount]) => [aKey(key), amount])),
		portions: []
	};
}

const foods = [
	aDatabaseFood('Beverages, drink mix, QUAKER OATS, powder'),
	aDatabaseFood('Cereals, oats, regular and quick, not fortified, dry'),
	aDatabaseFood('Oats'),
	aDatabaseFood('Milk, whole')
];

describe('matchFoods', () => {
	it('finds foods with every typed word, in any order and case', () => {
		expect(matchFoods(foods, 'DRY oats', 10).map((food) => food.name)).toEqual([
			'Cereals, oats, regular and quick, not fortified, dry'
		]);
	});

	it('puts names that start with the first word first, then shorter names', () => {
		expect(matchFoods(foods, 'oats', 10).map((food) => food.name)).toEqual([
			'Oats',
			'Beverages, drink mix, QUAKER OATS, powder',
			'Cereals, oats, regular and quick, not fortified, dry'
		]);
	});

	it('finds nothing for blank text, and at most the limit', () => {
		expect(matchFoods(foods, '  ', 10)).toEqual([]);
		expect(matchFoods(foods, 'o', 2)).toHaveLength(2);
	});
});

describe('servingValues', () => {
	it('scales the numbers per 100 g to a serving, for the tracker’s number fields only', () => {
		const tracker = aTracker({
			fields: [
				aNumberField({ key: 'servings' }),
				aNumberField({ key: 'calories' }),
				aNumberField({ key: 'protein' })
			],
			goal: daysAWeek(1)
		});
		const oats = aDatabaseFood('Oats', [
			['calories', 379],
			['protein', 13.2],
			['sodium', 6]
		]);

		const values = servingValues(oats, 81, tracker.fields);

		expect(values.get(aKey('calories'))).toEqual({ type: FieldType.number, amount: 306.99 });
		expect(values.get(aKey('protein'))?.type).toBe(FieldType.number);
		expect(values.has(aKey('sodium'))).toBe(false);
		expect(values.has(aKey('servings'))).toBe(false);
	});
});
