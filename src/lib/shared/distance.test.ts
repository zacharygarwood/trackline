import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../tests/support/result.ts';
import { DistanceUnit } from './distance-unit.constants.ts';
import { Distance, InvalidDistance } from './distance.ts';

describe('Distance', () => {
	it('stores metres and converts to either unit', () => {
		const run = expectOk(Distance.of(5, DistanceUnit.km));

		expect(run.meters).toBe(5000);
		expect(run.toUnit(DistanceUnit.mi)).toBeCloseTo(3.106856, 5);
	});

	it('round-trips miles', () => {
		expect(expectOk(Distance.of(3.4, DistanceUnit.mi)).toUnit(DistanceUnit.mi)).toBeCloseTo(3.4, 9);
	});

	it('builds from metres', () => {
		expect(expectOk(Distance.fromMeters(400)).toUnit(DistanceUnit.km)).toBe(0.4);
	});

	it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects %d', (amount) => {
		expect(expectErr(Distance.of(amount, DistanceUnit.km))).toBeInstanceOf(InvalidDistance);
		expect(expectErr(Distance.fromMeters(amount))).toBeInstanceOf(InvalidDistance);
	});
});
