/** How far back the Stats screen looks. */
export const StatsRange = {
	oneMonth: 'one-month',
	threeMonths: 'three-months',
	sixMonths: 'six-months',
	oneYear: 'one-year',
	all: 'all'
} as const;

/** One of the Stats time ranges. */
export type StatsRange = (typeof StatsRange)[keyof typeof StatsRange];

/** The ranges in the order the Stats screen offers them. */
export const STATS_RANGES = [
	StatsRange.oneMonth,
	StatsRange.threeMonths,
	StatsRange.sixMonths,
	StatsRange.oneYear,
	StatsRange.all
] as const;
