import { describe, expect, it } from 'vitest';
import { csvFields, portionLabel } from './build-food-database.ts';

describe('csvFields', () => {
	it('splits quoted fields, keeping commas and doubled quotes inside them', () => {
		expect(csvFields('"1","Oats, rolled","12"" pan"')).toEqual(['1', 'Oats, rolled', '12" pan']);
	});
});

describe('portionLabel', () => {
	it('reads a portion with a unit, a modifier, or both', () => {
		expect(portionLabel('1.0', 'cup', '')).toBe('1 cup');
		expect(portionLabel('1', 'cup', 'chopped')).toBe('1 cup, chopped');
		expect(portionLabel('1', undefined, 'medium')).toBe('1 medium');
	});
});
