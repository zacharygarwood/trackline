import { describe, expect, it } from 'vitest';
import { parseStepperInput, stepDown, stepUp, type StepRange } from './stepper.ts';

const weight: StepRange = { min: 0, max: 500, step: 2.5 };

describe('stepUp and stepDown', () => {
	it('moves by one step', () => {
		expect(stepUp(60, weight)).toBe(62.5);
		expect(stepDown(60, weight)).toBe(57.5);
	});

	it('avoids floating point drift', () => {
		expect(stepUp(0.1, { min: 0, max: 10, step: 0.2 })).toBe(0.3);
	});

	it('stays within the range', () => {
		expect(stepDown(1, weight)).toBe(0);
		expect(stepUp(499, weight)).toBe(500);
	});
});

describe('parseStepperInput', () => {
	it('reads a typed number', () => {
		expect(parseStepperInput('62.5', weight)).toBe(62.5);
	});

	it('accepts a comma as the decimal separator', () => {
		expect(parseStepperInput('62,5', weight)).toBe(62.5);
	});

	it('keeps the value within the range', () => {
		expect(parseStepperInput('900', weight)).toBe(500);
	});

	it.each(['', '  ', 'abc'])('rejects %j', (text) => {
		expect(parseStepperInput(text, weight)).toBeUndefined();
	});
});
