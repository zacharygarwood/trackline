import { describe, expect, it } from 'vitest';
import { formatMacroGoal, formatMacroNumber, formatMacroProgress } from './nutrition-format.ts';

describe('formatMacroProgress', () => {
	it('shows whole calories against the goal', () => {
		expect(formatMacroProgress('calories', 1064.4, 2453)).toBe('1,064 / 2,453 kcal');
	});

	it('shows grams to one decimal against the goal', () => {
		expect(formatMacroProgress('protein', 84.13, 150)).toBe('84.1 / 150 g');
	});
});

describe('formatMacroGoal', () => {
	it('puts the goal with its unit after a slash', () => {
		expect(formatMacroGoal('calories', 2200)).toBe('/ 2,200 kcal');
		expect(formatMacroGoal('fat', 70)).toBe('/ 70 g');
	});
});

describe('formatMacroNumber', () => {
	it('shows a whole number without a unit', () => {
		expect(formatMacroNumber(1359.4)).toBe('1,359');
		expect(formatMacroNumber(84.6)).toBe('85');
	});
});
