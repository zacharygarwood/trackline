import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../tests/support/result.ts';
import { InvalidMass, Mass } from './mass.ts';
import { MassUnit } from './mass-unit.constants.ts';

describe('Mass', () => {
	it('stores kilograms', () => {
		expect(expectOk(Mass.fromKg(80)).toUnit(MassUnit.kg)).toBe(80);
	});

	it('converts pounds to kilograms exactly', () => {
		expect(expectOk(Mass.fromLb(100)).kilograms).toBeCloseTo(45.359237, 9);
	});

	it('round-trips pounds', () => {
		expect(expectOk(Mass.fromLb(176.4)).toUnit(MassUnit.lb)).toBeCloseTo(176.4, 9);
	});

	it('builds a mass from an amount in either unit', () => {
		expect(expectOk(Mass.of(80, MassUnit.kg)).kilograms).toBe(80);
		expect(expectOk(Mass.of(100, MassUnit.lb)).kilograms).toBeCloseTo(45.359237, 9);
	});

	it('accepts zero, which means bodyweight for a set', () => {
		expect(expectOk(Mass.fromKg(0)).kilograms).toBe(0);
	});

	it.each([-0.1, Number.NaN, Number.POSITIVE_INFINITY])('rejects %d kg', (amount) => {
		expect(expectErr(Mass.fromKg(amount))).toBeInstanceOf(InvalidMass);
	});

	it('rejects negative pounds', () => {
		expect(expectErr(Mass.fromLb(-1))).toBeInstanceOf(InvalidMass);
	});

	it('compares by weight', () => {
		const eighty = expectOk(Mass.fromKg(80));

		expect(eighty.equals(expectOk(Mass.fromKg(80)))).toBe(true);
		expect(eighty.equals(expectOk(Mass.fromKg(81)))).toBe(false);
	});
});
