import { describe, expect, it } from 'vitest';
import { numberText, numberValue } from './number-text.ts';

describe('numberText', () => {
	it('keeps typed numbers as text and empty fields as empty text', () => {
		expect([numberText(80.4), numberText('12'), numberText(null), numberText(undefined)]).toEqual([
			'80.4',
			'12',
			'',
			''
		]);
	});
});

describe('numberValue', () => {
	it('reads typed text back as a number, or null', () => {
		expect([numberValue(' 80.4 '), numberValue(''), numberValue('x')]).toEqual([80.4, null, null]);
	});
});
