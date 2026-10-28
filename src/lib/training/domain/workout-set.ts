import type { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';

/** The fewest repetitions a set can have. */
export const MIN_REPS = 1;

/** The most repetitions a set can have. */
export const MAX_REPS = 999;

/** One set of an exercise: repetitions at a weight (zero means bodyweight). */
export interface WorkoutSet {
	readonly reps: number;
	readonly weight: Mass;
	readonly completed: boolean;
}

/** Raised when reps are not a whole number from 1 to 999. */
export class InvalidReps {
	/** @param reps - The rejected value. */
	constructor(readonly reps: number) {}
}

/**
 * Creates a set, rejecting impossible repetition counts.
 *
 * @param fields - Reps, weight, and whether the set is done.
 */
export function createWorkoutSet(fields: WorkoutSet): Result<WorkoutSet, InvalidReps> {
	const { reps } = fields;
	return Number.isInteger(reps) && reps >= MIN_REPS && reps <= MAX_REPS
		? ok({ ...fields })
		: err(new InvalidReps(reps));
}
