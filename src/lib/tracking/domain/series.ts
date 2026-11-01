import { last } from '../../shared/collections.ts';
import {
	byDay,
	fieldNumbers,
	measureIn,
	periodStart,
	type Calendar,
	type Goal,
	type History,
	type Span
} from './goal.ts';
import { GoalType, Period } from './tracking.constants.ts';

const DAY_BEFORE = -1;

/** How many days, weeks, or months back Stats charts a tracker. */
export const SERIES_LENGTH = 8;

/**
 * The current and earlier days, weeks, or months, oldest first. The current
 * one ends today.
 *
 * @param period - Days, weeks, or months.
 * @param calendar - Today and the week start.
 * @param count - How many.
 */
export function spansBack(period: Period, calendar: Calendar, count: number): readonly Span[] {
	const spans: Span[] = [];
	let end = calendar.today;
	while (spans.length < count) {
		const start = periodStart(period, { ...calendar, today: end });
		spans.unshift({ start, end });
		end = start.addDays(DAY_BEFORE);
	}
	return spans;
}

/**
 * What Stats charts for a goal, oldest first. A period goal gives its total,
 * average, or count for each of its last periods. A target goal gives the
 * latest value at the end of each week, from the first week with a value.
 *
 * @param goal - The tracker's goal.
 * @param history - The tracker's entries and sessions.
 * @param calendar - Today and the week start.
 */
export function seriesOf(goal: Goal, history: History, calendar: Calendar): readonly number[] {
	if (goal.type === GoalType.period) {
		return spansBack(goal.period, calendar, SERIES_LENGTH).map((span) =>
			measureIn(goal, history, span)
		);
	}
	const ordered = [...history.entries].sort(byDay);
	return spansBack(Period.week, calendar, SERIES_LENGTH).flatMap((span) => {
		const before = ordered.filter((entry) => !span.end.isBefore(entry.date));
		const latest = last(fieldNumbers(before, goal.field));
		return latest === undefined ? [] : [latest];
	});
}
