import { MassUnit } from './mass-unit.constants.ts';
import { err, ok, type Result } from './result.ts';

const KG_PER_LB = 0.45359237;

/** Raised when an amount cannot be a mass: negative, infinite, or not a number. */
export class InvalidMass {
	/** @param amount - The rejected amount, in the unit it was given in. */
	constructor(readonly amount: number) {}
}

/**
 * A non-negative weight, stored in kilograms.
 *
 * Users may enter and read weights in pounds; conversion happens only at the
 * edges through {@link Mass.of} and {@link Mass.toUnit}.
 */
export class Mass {
	private constructor(readonly kilograms: number) {}

	/** No weight, used for bodyweight exercises. */
	static readonly zero: Mass = new Mass(0);

	/**
	 * A mass from an amount in kilograms.
	 *
	 * @param kilograms - Must be finite and at least zero.
	 */
	static fromKg(kilograms: number): Result<Mass, InvalidMass> {
		return Number.isFinite(kilograms) && kilograms >= 0
			? ok(new Mass(kilograms))
			: err(new InvalidMass(kilograms));
	}

	/**
	 * A mass from an amount in pounds.
	 *
	 * @param pounds - Must be finite and at least zero.
	 */
	static fromLb(pounds: number): Result<Mass, InvalidMass> {
		const result = Mass.fromKg(pounds * KG_PER_LB);
		return result.ok ? result : err(new InvalidMass(pounds));
	}

	/**
	 * A mass from an amount in the given unit.
	 *
	 * @param amount - The amount as the user entered it.
	 * @param unit - The unit the amount is in.
	 */
	static of(amount: number, unit: MassUnit): Result<Mass, InvalidMass> {
		return unit === MassUnit.kg ? Mass.fromKg(amount) : Mass.fromLb(amount);
	}

	/**
	 * The amount of this mass in the given unit.
	 *
	 * @param unit - The unit to express the mass in.
	 */
	toUnit(unit: MassUnit): number {
		return unit === MassUnit.kg ? this.kilograms : this.kilograms / KG_PER_LB;
	}

	/** Whether both masses weigh exactly the same. */
	equals(other: Mass): boolean {
		return this.kilograms === other.kilograms;
	}
}
