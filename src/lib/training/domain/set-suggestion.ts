import { elementAt, last } from '../../shared/collections.ts';
import { Mass } from '../../shared/mass.ts';
import type { WorkoutSet } from './workout-set.ts';

/** Reps suggested for an exercise the user has never done. */
export const DEFAULT_REPS = 10;

/** What the next set of an exercise should start with, before the user adjusts it. */
export interface SetSuggestionContext {
	/** The sets already in this workout for the exercise. */
	readonly current: readonly WorkoutSet[];
	/** The sets from the most recent finished workout with the exercise. */
	readonly lastSession: readonly WorkoutSet[];
}

/**
 * Suggests the next set: a copy of the previous set in this workout,
 * otherwise the same set from last session, otherwise 10 reps at bodyweight.
 * Screens use only the measures the exercise tracks.
 *
 * @param context - This workout's and last session's sets for the exercise.
 * @returns An uncompleted set ready to adjust and check off.
 */
export function suggestNextSet(context: SetSuggestionContext): WorkoutSet {
	const base =
		last(context.current) ??
		elementAt(context.lastSession, context.current.length) ??
		last(context.lastSession);
	if (base === undefined) return { reps: DEFAULT_REPS, weight: Mass.zero, completed: false };
	return { ...base, completed: false };
}
