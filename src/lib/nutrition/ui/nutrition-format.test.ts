import { describe, expect, it } from 'vitest';
import { formatMacroProgress } from './nutrition-format.ts';

describe('formatMacroProgress', () => {
	it('shows whole calories against the goal', () => {
		expect(formatMacroProgress('calories', 1064.4, 2453)).toBe('1,064 / 2,453 kcal');
	});

	it('shows grams to one decimal against the goal', () => {
		expect(formatMacroProgress('protein', 84.13, 150)).toBe('84.1 / 150 g');
	});
});
