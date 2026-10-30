import { last } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { ExerciseDay, NutritionDay } from '../application/insights-queries.ts';
import { CardMeasure } from './stats.constants.ts';

const DAYS_PER_WEEK = 7;
/** Ranges longer than this many weeks draw one bar per four weeks. */
const WEEKLY_BARS_UP_TO = 26;
const WEEKS_PER_BAR_LONG = 4;
const SECONDS_PER_MINUTE = 60;

/** Measures charted as the best of each week, carried forward; the rest are weekly totals. */
const BEST_MEASURES: readonly CardMeasure[] = [
	CardMeasure.weight,
	CardMeasure.reps,
	CardMeasure.grade
];

/**
 * Whether a measure is charted as its best, rather than a total.
 *
 * @param measure - The measure.
 */
export function isBestMeasure(measure: CardMeasure): boolean {
	return BEST_MEASURES.includes(measure);
}

/**
 * Which week of a range a day falls in, 0 for the oldest.
 *
 * @param date - The day.
 * @param today - The last day of the range.
 * @param weeks - How many weeks the range covers.
 * @returns The week, or undefined if the day is outside the range.
 */
export function weekOf(date: LocalDate, today: LocalDate, weeks: number): number | undefined {
	const daysAgo = today.toEpochDay() - date.toEpochDay();
	const week = weeks - 1 - Math.floor(daysAgo / DAYS_PER_WEEK);
	return daysAgo < 0 || week < 0 ? undefined : week;
}

/**
 * Groups a weekly series into bars: one per week up to six months, one per four weeks beyond.
 *
 * @param weekly - One value per week, oldest first.
 * @param combine - How to combine the weeks of one bar.
 */
export function toBars(
	weekly: readonly number[],
	combine: (values: readonly number[]) => number
): readonly number[] {
	const size = weekly.length > WEEKLY_BARS_UP_TO ? WEEKS_PER_BAR_LONG : 1;
	const bars: number[] = [];
	for (let end = weekly.length; end > 0; end -= size) {
		bars.unshift(combine(weekly.slice(Math.max(0, end - size), end)));
	}
	return bars;
}

/** Adds up values. */
export const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

/** The mean of values, or zero for none. */
export const mean = (values: readonly number[]) =>
	values.length === 0 ? 0 : sum(values) / values.length;

/**
 * The average calories of the logged days of each week of a range.
 *
 * @param days - Days with food logged.
 * @param range - The last day and the number of weeks.
 * @param range.today - The last day.
 * @param range.weeks - How many weeks.
 */
export function weeklyCalories(
	days: readonly NutritionDay[],
	range: { readonly today: LocalDate; readonly weeks: number }
): readonly number[] {
	const weeks = Array.from({ length: range.weeks }, (): number[] => []);
	for (const day of days) {
		const week = weekOf(day.date, range.today, range.weeks);
		if (week !== undefined) weeks.at(week)?.push(day.calories);
	}
	return weeks.map(mean);
}

/**
 * One exercise's value for a day: its best weight in kilograms, most reps,
 * hardest grade plus one (so zero means none), or its total metres, minutes, or count.
 *
 * @param day - The exercise's day.
 * @param measure - What the card shows.
 */
export function dayValue(day: ExerciseDay, measure: CardMeasure): number {
	return DAY_VALUES[measure](day);
}

const DAY_VALUES: Readonly<Record<CardMeasure, (day: ExerciseDay) => number>> = {
	weight: (day) => day.heaviest?.kilograms ?? 0,
	reps: (day) => day.mostReps ?? 0,
	grade: (day) => (day.hardestGrade === undefined ? 0 : day.hardestGrade + 1),
	distance: (day) => day.meters,
	time: (day) => day.seconds / SECONDS_PER_MINUTE,
	count: (day) => day.count
};

/**
 * One exercise's weekly values over a range: the best of each week, or its total.
 *
 * @param days - The exercise's days.
 * @param context - What to measure and over which weeks.
 * @param context.measure - What the card shows.
 * @param context.today - The last day.
 * @param context.weeks - How many weeks.
 */
export function weeklyValues(
	days: readonly ExerciseDay[],
	context: { readonly measure: CardMeasure; readonly today: LocalDate; readonly weeks: number }
): readonly number[] {
	const weeks = Array.from({ length: context.weeks }, () => 0);
	const best = isBestMeasure(context.measure);
	for (const day of days) {
		const week = weekOf(day.date, context.today, context.weeks);
		const value = dayValue(day, context.measure);
		if (week !== undefined) {
			weeks[week] = best ? Math.max(weeks.at(week) ?? 0, value) : (weeks.at(week) ?? 0) + value;
		}
	}
	return weeks;
}

/**
 * A best-of series with gaps filled by the latest best, starting at the first week with any.
 *
 * @param weekly - One value per week, zero for none.
 */
export function carriedForward(weekly: readonly number[]): readonly number[] {
	const points: number[] = [];
	for (const value of weekly) {
		const latest = last(points);
		if (value > 0) points.push(value);
		else if (latest !== undefined) points.push(latest);
	}
	return points;
}
