import type { Distance } from '../../shared/distance.ts';
import type { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';

/** The fewest repetitions a set can have. */
export const MIN_REPS = 1;

/** The most repetitions a set can have. */
export const MAX_REPS = 999;

/**
 * One set or effort of an exercise. It records only what its exercise tracks:
 * reps at a weight (zero means bodyweight), a time, a distance, a grade, or a count.
 */
export interface WorkoutSet {
	readonly reps?: number | undefined;
	readonly weight?: Mass | undefined;
	/** How long it took, in seconds. */
	readonly seconds?: number | undefined;
	readonly distance?: Distance | undefined;
	/** Its position on the exercise's grade scale, 0 for the easiest grade. */
	readonly grade?: number | undefined;
	/** How many of what the exercise counts, such as laps. */
	readonly count?: number | undefined;
	readonly completed: boolean;
}

/** Raised when reps are not a whole number from 1 to 999. */
export class InvalidReps {
	/** @param reps - The rejected value. */
	constructor(readonly reps: number) {}
}

/** Raised when a time, grade, or count is negative or not a number, or a grade isn't whole. */
export class InvalidMeasure {
	/** @param measure - The rejected value. */
	constructor(readonly measure: number) {}
}

/** Raised for a set that records nothing. */
export class EmptySet {}

/** Why a set is invalid. */
export type InvalidSet = InvalidReps | InvalidMeasure | EmptySet;

const isAmount = (value: number) => Number.isFinite(value) && value >= 0;

function invalidMeasure(fields: WorkoutSet): number | undefined {
	const { seconds, grade, count } = fields;
	if (seconds !== undefined && !isAmount(seconds)) return seconds;
	if (count !== undefined && !isAmount(count)) return count;
	if (grade !== undefined && !(Number.isInteger(grade) && grade >= 0)) return grade;
	return undefined;
}

/**
 * Creates a set, rejecting impossible values and sets that record nothing.
 *
 * @param fields - What the set recorded and whether it is done.
 */
export function createWorkoutSet(fields: WorkoutSet): Result<WorkoutSet, InvalidSet> {
	const { reps, weight, seconds, distance, grade, count } = fields;
	if (reps !== undefined && !(Number.isInteger(reps) && reps >= MIN_REPS && reps <= MAX_REPS)) {
		return err(new InvalidReps(reps));
	}
	const measure = invalidMeasure(fields);
	if (measure !== undefined) return err(new InvalidMeasure(measure));
	const recorded = [reps, weight, seconds, distance, grade, count].some(
		(value) => value !== undefined
	);
	return recorded ? ok({ ...fields }) : err(new EmptySet());
}
