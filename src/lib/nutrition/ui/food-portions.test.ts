import { describe, expect, it } from 'vitest';
import { amountLabel, baseLabel, stepAmount, unitName } from './food-portions.ts';

describe('food portions', () => {
	it('steps each unit by its own amount, never below one step', () => {
		expect(stepAmount(100, 'g', 1)).toBe(110);
		expect(stepAmount(1, 'serving', -1)).toBe(0.5);
		expect(stepAmount(0.25, 'cup', -1)).toBe(0.25);
		expect(stepAmount(2, 'scoop', 1)).toBe(3);
	});

	it('names units for one or more', () => {
		expect([unitName('serving', 1), unitName('serving', 2), unitName('cup', 0.5)]).toEqual([
			'serving',
			'servings',
			'cups'
		]);
		expect(unitName('g', 100)).toBe('g');
	});

	it('labels counted amounts by how many, and measured ones by size', () => {
		expect(amountLabel(1, 'piece')).toBe('');
		expect(amountLabel(3, 'piece')).toBe('×3');
		expect(amountLabel(1.5, 'cup')).toBe('1.5 cups');
		expect(baseLabel({ amount: 100, unit: 'g' })).toBe('100 g');
		expect(baseLabel({ amount: 1, unit: 'serving' })).toBe('');
	});
});
