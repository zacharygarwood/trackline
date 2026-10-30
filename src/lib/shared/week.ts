import type { LocalDate } from './local-date.ts';
import { WeekStart } from './week-start.constants.ts';

const DAYS_PER_WEEK = 7;
/** 1970-01-01, epoch day 0, was a Thursday: three days after a Monday. */
const EPOCH_DAY_AFTER_MONDAY = 3;

/**
 * The first day of the calendar week a date falls in.
 *
 * @param date - Any day.
 * @param weekStart - The day weeks begin on.
 */
export function startOfWeek(date: LocalDate, weekStart: WeekStart): LocalDate {
	const sinceMonday = date.toEpochDay() + EPOCH_DAY_AFTER_MONDAY;
	const sinceStart = weekStart === WeekStart.sunday ? sinceMonday + 1 : sinceMonday;
	return date.addDays(-(((sinceStart % DAYS_PER_WEEK) + DAYS_PER_WEEK) % DAYS_PER_WEEK));
}
