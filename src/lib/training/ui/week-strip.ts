import type { LocalDate } from '../../shared/local-date.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import { startOfWeek } from '../../shared/week.ts';
import type { TrainingDay } from '../application/get-training-days.ts';
import { WeekDayState } from './week-strip.constants.ts';

const DAYS_PER_WEEK = 7;

/** One day of the current calendar week. */
export interface WeekStripDay {
	readonly date: LocalDate;
	readonly state: WeekDayState;
}

/** The current week and what is known about its days. */
export interface WeekStripInput {
	readonly today: LocalDate;
	readonly weekStart: WeekStart;
	/** Recent days, covering at least the week so far. */
	readonly days: readonly TrainingDay[];
}

function stateOf(date: LocalDate, input: WeekStripInput): WeekDayState {
	if (input.today.isBefore(date)) return WeekDayState.upcoming;
	const known = input.days.find((day) => day.date.equals(date));
	if (known?.trained === true) return WeekDayState.trained;
	if (known?.rested === true) return WeekDayState.rested;
	return date.equals(input.today) ? WeekDayState.today : WeekDayState.missed;
}

/**
 * Lays out the current calendar week, first day first, for the Today screen.
 *
 * @param input - Today, the first day of the week, and the recent training days.
 * @returns Seven days.
 */
export function weekStrip(input: WeekStripInput): readonly WeekStripDay[] {
	const start = startOfWeek(input.today, input.weekStart);
	return Array.from({ length: DAYS_PER_WEEK }, (_, offset) => {
		const date = start.addDays(offset);
		return { date, state: stateOf(date, input) };
	});
}

/**
 * How many days of a week strip had a workout.
 *
 * @param days - The week.
 */
export function workoutsIn(days: readonly WeekStripDay[]): number {
	return days.filter((day) => day.state === WeekDayState.trained).length;
}
