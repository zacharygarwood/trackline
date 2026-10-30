/**
 * How an exercise is logged during a workout: a row of set boxes (reps),
 * one timed effort finished with Done (time without reps), or a growing list
 * of efforts (everything else, such as climbs).
 */
export const SessionMode = {
	sets: 'sets',
	single: 'single',
	multi: 'multi'
} as const;

/** One of the {@link SessionMode} values. */
export type SessionMode = (typeof SessionMode)[keyof typeof SessionMode];
