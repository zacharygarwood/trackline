import type { LocalDate } from '../../shared/local-date.ts';
import { startOfWeek } from '../../shared/week.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import { Period } from '../domain/tracker.constants.ts';
import { combineEntries, type Tracker, type TrackerEntry } from '../domain/tracker.ts';

const DAYS_PER_WEEK = 7;

/** What a tracker's chart on Stats covers. */
export interface TrackerChartInput {
	readonly tracker: Tracker;
	/** Entries of any trackers within the weeks charted. */
	readonly entries: readonly TrackerEntry[];
	readonly today: LocalDate;
	readonly weeks: number;
	readonly weekStart: WeekStart;
}

function dailyAverage(input: TrackerChartInput, start: LocalDate, end: LocalDate): number {
	const days = Array.from({ length: DAYS_PER_WEEK }, (_, offset) => start.addDays(offset)).filter(
		(day) => !day.isBefore(start) && day.isBefore(end)
	);
	const values = days
		.map((day) =>
			combineEntries(
				input.tracker,
				input.entries.filter((entry) => entry.date.equals(day)),
				day
			)
		)
		.filter((value) => value > 0);
	return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * One value per week, oldest first, ending with the current week: a weekly
 * tracker's combined week, or a daily tracker's average over the days logged.
 *
 * @param input - The tracker, its entries, and the weeks to chart.
 */
export function weeklyValues(input: TrackerChartInput): readonly number[] {
	const current = startOfWeek(input.today, input.weekStart);
	return Array.from({ length: input.weeks }, (_, index) => {
		const start = current.addDays(-(input.weeks - 1 - index) * DAYS_PER_WEEK);
		const end = start.addDays(DAYS_PER_WEEK);
		if (input.tracker.period === Period.day) return dailyAverage(input, start, end);
		return combineEntries(
			input.tracker,
			input.entries.filter((entry) => entry.date.isBefore(end)),
			start
		);
	});
}
