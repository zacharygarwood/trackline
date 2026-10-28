import { describe, expect, it } from 'vitest';
import { aWeighInId } from '../../../../tests/builders/weigh-in.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { createWeighIn, WeightOutOfRange } from './weigh-in.ts';

const today = expectOk(LocalDate.parse('2026-10-27'));
const kg = (amount: number) => expectOk(Mass.fromKg(amount));

describe('createWeighIn', () => {
	it('records a body weight on a date', () => {
		const weighIn = expectOk(createWeighIn({ id: aWeighInId(), date: today, weight: kg(80.4) }));

		expect(weighIn.weight.kilograms).toBe(80.4);
		expect(weighIn.date.equals(today)).toBe(true);
	});

	it.each([20, 400])('accepts the limit of %d kg', (amount) => {
		expect(
			expectOk(createWeighIn({ id: aWeighInId(), date: today, weight: kg(amount) })).weight
				.kilograms
		).toBe(amount);
	});

	it.each([19.9, 400.1, 0])('rejects %d kg as not a body weight', (amount) => {
		expect(
			expectErr(createWeighIn({ id: aWeighInId(), date: today, weight: kg(amount) }))
		).toBeInstanceOf(WeightOutOfRange);
	});
});
