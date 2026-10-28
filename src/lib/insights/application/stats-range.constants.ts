/** How far back the Stats charts look. */
export const StatsRange = {
	fourWeeks: 'four-weeks',
	threeMonths: 'three-months',
	oneYear: 'one-year',
	all: 'all'
} as const;

/** One of the Stats time ranges. */
export type StatsRange = (typeof StatsRange)[keyof typeof StatsRange];
