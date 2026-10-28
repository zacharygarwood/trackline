/** The day a calendar week begins on, as the user prefers. */
export const WeekStart = {
	monday: 'monday',
	sunday: 'sunday'
} as const;

/** One of the {@link WeekStart} values. */
export type WeekStart = (typeof WeekStart)[keyof typeof WeekStart];
