import { last } from '../../shared/collections.ts';
import type { Field, FieldKey } from './field.ts';
import {
	byDay,
	fieldNumbers,
	measureIn,
	periodStart,
	type Calendar,
	type CountGoal,
	type Counted,
	type FieldGoal,
	type History,
	type Span
} from './goal.ts';
import type { Tracker } from './tracker.ts';
import {
	Dimension,
	FieldType,
	GoalType,
	Measure,
	Period,
	StatType,
	TrackerKind
} from './tracking.constants.ts';

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
 * What Stats charts for a tracker: a total, average, or count each period, or
 * the trend of a field's latest value, like a weight. It follows the goal,
 * unless the goal only counts days and the tracker has a value worth charting.
 */
export type Stat =
	| (Counted & {
			readonly type: typeof StatType.counts;
			readonly period: Period;
			/** The goal's target, drawn as a line when the stat is what the goal counts. */
			readonly goal: number | undefined;
	  })
	| {
			readonly type: typeof StatType.trend;
			readonly field: FieldKey;
			/** The goal's target, drawn as a line when the stat is what the goal counts. */
			readonly goal: number | undefined;
	  };

const CHARTED: readonly FieldType[] = [FieldType.number, FieldType.duration, FieldType.rating];

function fieldStat(field: Field, period: Period): Stat {
	if (field.type === FieldType.number && field.dimension === Dimension.mass)
		return { type: StatType.trend, field: field.key, goal: undefined };
	const average = field.type === FieldType.rating;
	return {
		type: StatType.counts,
		measure: average ? Measure.average : Measure.total,
		field: field.key,
		period: average ? Period.week : period,
		goal: undefined
	};
}

function countedOf(goal: FieldGoal | CountGoal): Counted {
	return goal.field === undefined
		? { measure: goal.measure }
		: { measure: goal.measure, field: goal.field };
}

/**
 * What Stats charts for a tracker. A goal of a field, or a target, is charted
 * as it is. A log whose goal only counts days charts its first number, time,
 * or rating instead: a weight as its trend, a rating as its weekly average,
 * and anything else as its total each period. Other counts, like workouts,
 * stay counts.
 *
 * @param tracker - The tracker.
 */
export function statOf(tracker: Pick<Tracker, 'kind' | 'fields' | 'goal'>): Stat {
	const { goal } = tracker;
	if (goal.type === GoalType.target)
		return { type: StatType.trend, field: goal.field, goal: goal.target };
	const field =
		goal.field === undefined && tracker.kind === TrackerKind.log
			? tracker.fields.find((candidate) => CHARTED.includes(candidate.type))
			: undefined;
	if (field !== undefined) return fieldStat(field, goal.period);
	return { type: StatType.counts, ...countedOf(goal), period: goal.period, goal: goal.target };
}

/**
 * What Stats charts, oldest first. A period stat gives its total, average, or
 * count for each of its last periods. A trend gives the latest value at the
 * end of each week, from the first week with a value.
 *
 * @param stat - What to chart.
 * @param history - The tracker's entries and sessions.
 * @param calendar - Today and the week start.
 */
export function seriesOf(stat: Stat, history: History, calendar: Calendar): readonly number[] {
	if (stat.type === StatType.counts) {
		return spansBack(stat.period, calendar, SERIES_LENGTH).map((span) =>
			measureIn(stat, history, span)
		);
	}
	const ordered = [...history.entries].sort(byDay);
	return spansBack(Period.week, calendar, SERIES_LENGTH).flatMap((span) => {
		const before = ordered.filter((entry) => !span.end.isBefore(entry.date));
		const latest = last(fieldNumbers(before, stat.field));
		return latest === undefined ? [] : [latest];
	});
}
