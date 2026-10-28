import type { LocalDate } from '../shared/local-date.ts';
import type { HeatmapShade } from './heatmap.constants.ts';

const DAYS_PER_WEEK = 7;
/** 1970-01-01, epoch day 0, was a Thursday: three days after a Monday. */
const EPOCH_DAY_AFTER_MONDAY = 3;

/** One day in the grid: a week column and a weekday row, Monday first. */
export interface HeatmapCell {
	readonly date: LocalDate;
	readonly column: number;
	readonly row: number;
	readonly shade: HeatmapShade;
}

/** What the heatmap covers and how each day is filled. */
export interface HeatmapInput {
	/** The last day drawn; its week is the last column. */
	readonly today: LocalDate;
	readonly weeks: number;
	readonly shadeOf: (date: LocalDate) => HeatmapShade;
}

function weekdayFromMonday(date: LocalDate): number {
	const weekday = (date.toEpochDay() + EPOCH_DAY_AFTER_MONDAY) % DAYS_PER_WEEK;
	return (weekday + DAYS_PER_WEEK) % DAYS_PER_WEEK;
}

/**
 * Lays out days as a GitHub-style grid: one column per week, Monday at the
 * top, ending with the current week, which stops at today.
 *
 * @param input - The last day, the number of weeks, and each day's shade.
 * @returns Cells oldest first.
 */
export function layoutHeatmap(input: HeatmapInput): readonly HeatmapCell[] {
	const lastWeekStart = input.today.addDays(-weekdayFromMonday(input.today));
	const start = lastWeekStart.addDays(-(input.weeks - 1) * DAYS_PER_WEEK);
	const count = input.today.toEpochDay() - start.toEpochDay() + 1;
	return Array.from({ length: count }, (_, offset) => {
		const date = start.addDays(offset);
		return {
			date,
			column: Math.floor(offset / DAYS_PER_WEEK),
			row: offset % DAYS_PER_WEEK,
			shade: input.shadeOf(date)
		};
	});
}
