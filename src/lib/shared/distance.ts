import { DistanceUnit } from './distance-unit.constants.ts';
import { err, ok, type Result } from './result.ts';

const METERS_PER_KM = 1000;
const METERS_PER_MILE = 1609.344;

/** Raised when an amount cannot be a distance: negative, infinite, or not a number. */
export class InvalidDistance {
	/** @param amount - The rejected amount, in the unit it was given in. */
	constructor(readonly amount: number) {}
}

/**
 * A non-negative distance, stored in metres. Users enter and read miles or
 * kilometres; conversion happens only at the edges.
 */
export class Distance {
	private constructor(readonly meters: number) {}

	/**
	 * A distance from an amount in metres.
	 *
	 * @param meters - Must be finite and at least zero.
	 */
	static fromMeters(meters: number): Result<Distance, InvalidDistance> {
		return Number.isFinite(meters) && meters >= 0
			? ok(new Distance(meters))
			: err(new InvalidDistance(meters));
	}

	/**
	 * A distance from an amount in the given unit.
	 *
	 * @param amount - The amount as the user entered it.
	 * @param unit - The unit the amount is in.
	 */
	static of(amount: number, unit: DistanceUnit): Result<Distance, InvalidDistance> {
		const result = Distance.fromMeters(amount * metersPer(unit));
		return result.ok ? result : err(new InvalidDistance(amount));
	}

	/**
	 * The amount of this distance in the given unit.
	 *
	 * @param unit - The unit to express it in.
	 */
	toUnit(unit: DistanceUnit): number {
		return this.meters / metersPer(unit);
	}
}

function metersPer(unit: DistanceUnit): number {
	return unit === DistanceUnit.km ? METERS_PER_KM : METERS_PER_MILE;
}
