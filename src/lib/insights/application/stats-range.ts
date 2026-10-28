import type { LocalDate } from '../../shared/local-date.ts';
import { StatsRange } from './stats-range.constants.ts';

const FOUR_WEEKS_DAYS = 28;
const THREE_MONTHS_DAYS = 91;
const ONE_YEAR_DAYS = 365;

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
 * The first day a range covers, ending today.
 *
 * @param range - The chosen range.
 * @param today - The last day of the range.
 * @returns Undefined for all time.
 */
export function rangeStart(range: StatsRange, today: LocalDate): LocalDate | undefined {
	switch (range) {
		case StatsRange.fourWeeks:
			return startOfDays(today, FOUR_WEEKS_DAYS);
		case StatsRange.threeMonths:
			return startOfDays(today, THREE_MONTHS_DAYS);
		case StatsRange.oneYear:
			return startOfDays(today, ONE_YEAR_DAYS);
		case StatsRange.all:
			return undefined;
	}
}
