import { last } from '../shared/collections.ts';
import type { LocalDate } from '../shared/local-date.ts';
import type { WeekStart } from '../shared/week-start.constants.ts';
import { startOfWeek } from '../shared/week.ts';

const DAYS_PER_WEEK = 7;
/** Month labels closer than this many columns would overlap. */
const MIN_LABEL_COLUMNS = 3;
const SHORT = 30;
const MEDIUM = 50;
const LONG = 70;

/** The minutes that start each brighter shade after the first. */
const THRESHOLDS = [SHORT, MEDIUM, LONG];

/**
 * How brightly a day is shaded, from 0 (no workout) to 4 (70 minutes or more).
 *
 * @param minutes - Minutes of finished workouts that day.
 */
export function heatLevel(minutes: number): number {
	if (minutes <= 0) return 0;
	return 1 + THRESHOLDS.filter((threshold) => minutes >= threshold).length;
}

/** What the heatmap covers. */
export interface WorkoutHeatmapInput {
	readonly today: LocalDate;
	/** How many week columns to draw, ending with the current week. */
	readonly weeks: number;
	/** How many of the latest weeks the chosen range covers; earlier weeks are dimmed. */
	readonly rangeWeeks: number;
	readonly weekStart: WeekStart;
	readonly minutesOf: (date: LocalDate) => number;
}

/** One day: its week column, weekday row, and shade. */
export interface WorkoutHeatCell {
	readonly date: LocalDate;
	readonly column: number;
	readonly row: number;
	/** From 0, no workout, to 4. */
	readonly level: number;
	readonly inRange: boolean;
	readonly today: boolean;
	/** Later this week, drawn as an outline. */
	readonly future: boolean;
}

/** A month name above the column where it starts. */
export interface MonthLabel {
	readonly column: number;
	/** A day in that month: the first of it, or the first day drawn. */
	readonly date: LocalDate;
}

/** The cells and month labels of the heatmap. */
export interface WorkoutHeatmapLayout {
	readonly cells: readonly WorkoutHeatCell[];
	readonly months: readonly MonthLabel[];
}

function monthLabels(cells: readonly WorkoutHeatCell[]): readonly MonthLabel[] {
	const labels: MonthLabel[] = [];
	for (const cell of cells) {
		const first = cell.date.day === 1;
		if (!(first || (cell.column === 0 && cell.row === 0))) continue;
		const previous = last(labels);
		if (previous !== undefined && cell.column - previous.column < MIN_LABEL_COLUMNS) {
			if (!first) continue;
			labels.pop();
		}
		labels.push({ column: cell.column, date: cell.date });
	}
	return labels;
}

/**
 * Lays out workout days as a grid of whole weeks, the first day of the week
 * on top, ending with the current week.
 *
 * @param input - The days to cover and each day's minutes.
 */
export function layoutWorkoutHeatmap(input: WorkoutHeatmapInput): WorkoutHeatmapLayout {
	const start = startOfWeek(input.today, input.weekStart).addDays(
		-(input.weeks - 1) * DAYS_PER_WEEK
	);
	const firstInRange = input.weeks - input.rangeWeeks;
	const cells = Array.from({ length: input.weeks * DAYS_PER_WEEK }, (_, offset) => {
		const date = start.addDays(offset);
		const column = Math.floor(offset / DAYS_PER_WEEK);
		const future = input.today.isBefore(date);
		return {
			date,
			column,
			row: offset % DAYS_PER_WEEK,
			level: future ? 0 : heatLevel(input.minutesOf(date)),
			inRange: column >= firstInRange,
			today: date.equals(input.today),
			future
		};
	});
	return { cells, months: monthLabels(cells) };
}
