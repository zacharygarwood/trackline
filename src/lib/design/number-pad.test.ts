import { describe, expect, it } from 'vitest';
import { pressKey, type NumberPadLimits } from './number-pad.ts';
import { NumberPadAction } from './number-pad.constants.ts';

const weight: NumberPadLimits = { allowDecimal: true, maxIntegerDigits: 3, maxFractionDigits: 1 };
const reps: NumberPadLimits = { allowDecimal: false, maxIntegerDigits: 3, maxFractionDigits: 0 };

const type = (keys: readonly string[], limits = weight) =>
	keys.reduce((value, key) => pressKey(value, key, limits), '');

describe('pressKey', () => {
	it('appends digits', () => {
		expect(type(['8', '0'])).toBe('80');
	});

	it('replaces a lone leading zero', () => {
		expect(type(['0', '7'])).toBe('7');
	});

	it('adds one decimal separator', () => {
		expect(type(['8', NumberPadAction.decimal, '5', NumberPadAction.decimal])).toBe('8.5');
	});

	it('starts with zero when the decimal separator comes first', () => {
		expect(type([NumberPadAction.decimal, '5'])).toBe('0.5');
	});

	it('ignores the decimal separator for whole numbers', () => {
		expect(type(['1', NumberPadAction.decimal, '2'], reps)).toBe('12');
	});

	it('limits the digits before the separator', () => {
		expect(type(['1', '2', '3', '4'])).toBe('123');
	});

	it('limits the digits after the separator', () => {
		expect(type(['8', NumberPadAction.decimal, '4', '5'])).toBe('8.4');
	});

	it('deletes the last character', () => {
		expect(pressKey('80.4', NumberPadAction.backspace, weight)).toBe('80.');
		expect(pressKey('', NumberPadAction.backspace, weight)).toBe('');
	});
});
