/** What a day in the week strip shows: a workout, a rest day, nothing, today with nothing yet, or a day still ahead. */
export const WeekDayState = {
	trained: 'trained',
	rested: 'rested',
	missed: 'missed',
	today: 'today',
	upcoming: 'upcoming'
} as const;

/** One of the {@link WeekDayState} values. */
export type WeekDayState = (typeof WeekDayState)[keyof typeof WeekDayState];
