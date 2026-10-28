import type { Id } from '../../shared/id.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';

/** The lightest plausible adult body weight. */
export const MIN_BODY_WEIGHT_KG = 20;

/** The heaviest body weight the app accepts. */
export const MAX_BODY_WEIGHT_KG = 400;

/** Identifies one weigh-in. */
export type WeighInId = Id<'WeighIn'>;

/** A body weight recorded on a calendar day. There is at most one per day. */
export interface WeighIn {
	readonly id: WeighInId;
	readonly date: LocalDate;
	readonly weight: Mass;
}

/** Raised when a weight is outside the plausible range for a person. */
export class WeightOutOfRange {
	/** @param weight - The rejected weight. */
	constructor(readonly weight: Mass) {}
}

/**
 * Whether a weight is plausible as a person's body weight (20–400 kg).
 *
 * @param weight - The weight to check.
 */
export function isBodyWeight(weight: Mass): boolean {
	return weight.kilograms >= MIN_BODY_WEIGHT_KG && weight.kilograms <= MAX_BODY_WEIGHT_KG;
}

/**
 * Creates a weigh-in, rejecting implausible weights.
 *
 * @param fields - The weigh-in's id, date, and weight.
 */
export function createWeighIn(fields: WeighIn): Result<WeighIn, WeightOutOfRange> {
	return isBodyWeight(fields.weight) ? ok({ ...fields }) : err(new WeightOutOfRange(fields.weight));
}
