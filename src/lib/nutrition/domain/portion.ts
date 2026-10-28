import { err, ok, type Result } from '../../shared/result.ts';

/** The longest unit name, such as "slice" or "scoop". */
export const MAX_UNIT_LENGTH = 20;

/** An amount of food in a unit: 100 g, 250 ml, or 1 slice. */
export interface Portion {
	readonly amount: number;
	readonly unit: string;
}

/** Raised when an amount is not a positive number. */
export class InvalidAmount {
	/** @param amount - The rejected amount. */
	constructor(readonly amount: number) {}
}

/** Raised when a unit is empty or too long. */
export class InvalidUnit {
	/** @param unit - The rejected unit. */
	constructor(readonly unit: string) {}
}

/**
 * Whether an amount of food is positive and finite.
 *
 * @param amount - The amount to check.
 */
export function isAmount(amount: number): boolean {
	return Number.isFinite(amount) && amount > 0;
}

/**
 * Creates a portion, trimming the unit.
 *
 * @param portion - The amount and unit as entered.
 */
export function createPortion(portion: Portion): Result<Portion, InvalidAmount | InvalidUnit> {
	const unit = portion.unit.trim();
	if (!isAmount(portion.amount)) return err(new InvalidAmount(portion.amount));
	if (unit.length === 0 || unit.length > MAX_UNIT_LENGTH) return err(new InvalidUnit(portion.unit));
	return ok({ amount: portion.amount, unit });
}
