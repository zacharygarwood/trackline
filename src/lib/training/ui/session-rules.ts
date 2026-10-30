import type { Exercise } from '../domain/exercise.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { tracks } from '../domain/tracking.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import { SessionMode } from './session-mode.constants.ts';

/** Sets a reps exercise aims for when no template says otherwise. */
export const DEFAULT_SETS = 3;

const MS_PER_SECOND = 1000;

/** The position `findIndex` and {@link nextOpen} return when nothing matches. */
export const NONE = -1;

/**
 * How an exercise is logged during a workout.
 *
 * @param exercise - The exercise.
 */
export function sessionMode(exercise: Exercise): SessionMode {
	if (tracks(exercise.tracking, TrackedField.reps)) return SessionMode.sets;
	return tracks(exercise.tracking, TrackedField.time) ? SessionMode.single : SessionMode.multi;
}

/**
 * How many sets an exercise aims for: its template's count, three for other
 * reps exercises, and none for exercises without reps.
 *
 * @param exercise - The exercise.
 * @param template - The template the workout came from, if any.
 */
export function targetSets(exercise: Exercise, template: WorkoutTemplate | undefined): number {
	if (!tracks(exercise.tracking, TrackedField.reps)) return 0;
	const planned = template?.exercises.find((planned) => planned.exerciseId === exercise.id);
	return planned?.targetSets ?? DEFAULT_SETS;
}

/**
 * The next exercise still open after a position, wrapping around to the start.
 *
 * @param done - Whether each exercise of the workout is done, in order.
 * @param from - The position to look after; -1 to start at the first.
 * @returns Its position, or -1 when every exercise is done.
 */
export function nextOpen(done: readonly boolean[], from: number): number {
	const after = done.findIndex((isDone, position) => position > from && !isDone);
	return after === NONE ? done.findIndex((isDone) => !isDone) : after;
}

/** A stopwatch for one exercise: time banked before, and when it last started if running. */
export interface Stopwatch {
	readonly banked: number;
	readonly since: number | undefined;
}

/** A stopwatch at zero, not running. */
export const STOPPED: Stopwatch = { banked: 0, since: undefined };

/**
 * The seconds a stopwatch shows.
 *
 * @param watch - The stopwatch.
 * @param now - The current time, in epoch milliseconds.
 */
export function stopwatchSeconds(watch: Stopwatch, now: number): number {
	return (watch.banked + (watch.since === undefined ? 0 : now - watch.since)) / MS_PER_SECOND;
}

/**
 * Starts a stopped stopwatch or pauses a running one.
 *
 * @param watch - The stopwatch.
 * @param now - The current time, in epoch milliseconds.
 */
export function toggleStopwatch(watch: Stopwatch, now: number): Stopwatch {
	return watch.since === undefined
		? { banked: watch.banked, since: now }
		: { banked: watch.banked + (now - watch.since), since: undefined };
}
