import type { LocalDate } from '../../shared/local-date.ts';
import { StatsRange } from './stats-range.constants.ts';

const DAYS_PER_WEEK = 7;
const ONE_MONTH_WEEKS = 4;
const THREE_MONTHS_WEEKS = 13;
const SIX_MONTHS_WEEKS = 26;
const ONE_YEAR_WEEKS = 52;

/** How many weeks the heatmap shows, and how many weeks "all" covers on charts. */
export const ALL_WEEKS = 104;

/**
 * Counts back a number of days, including today.
 *
 * @param today - The last day.
 * @param days - How many days to cover.
 */
export function startOfDays(today: LocalDate, days: number): LocalDate {
	return today.addDays(1 - days);
}

/**
 * How many weeks a range covers, ending this week.
 *
 * @param range - The chosen range.
 */
export function rangeWeeks(range: StatsRange): number {
	switch (range) {
		case StatsRange.oneMonth:
			return ONE_MONTH_WEEKS;
		case StatsRange.threeMonths:
			return THREE_MONTHS_WEEKS;
		case StatsRange.sixMonths:
			return SIX_MONTHS_WEEKS;
		case StatsRange.oneYear:
			return ONE_YEAR_WEEKS;
		case StatsRange.all:
			return ALL_WEEKS;
	}
}

/**
 * The first day a range covers, ending today.
 *
 * @param range - The chosen range.
 * @param today - The last day of the range.
 * @returns Undefined for all time.
 */
export function rangeStart(range: StatsRange, today: LocalDate): LocalDate | undefined {
	return range === StatsRange.all
		? undefined
		: startOfDays(today, rangeWeeks(range) * DAYS_PER_WEEK);
}
