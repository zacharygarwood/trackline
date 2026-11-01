import { first, last } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { startOfWeek } from '../../shared/week.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import {
	MAX_NUMBER,
	MAX_STARS,
	numberOf,
	type Field,
	type FieldKey,
	type FieldValue
} from './field.ts';
import type { Session } from './session.ts';
import {
	Direction,
	FieldType,
	GoalType,
	KIND_RULES,
	Measure,
	Period,
	SessionState,
	type TrackerKind
} from './tracking.constants.ts';

interface PeriodGoalBase {
	readonly type: typeof GoalType.period;
	/** The number to reach or stay under, in the field's stored unit. */
	readonly target: number;
	readonly direction: Direction;
	readonly period: Period;
}

/** A goal for a total or an average of one field each period, like 8 glasses a day. */
export type FieldGoal = PeriodGoalBase & {
	readonly measure: typeof Measure.total | typeof Measure.average;
	readonly field: FieldKey;
};

/** A goal for how many entries, days, or sessions each period, like 3 workouts a week. */
export type CountGoal = PeriodGoalBase & {
	readonly measure: typeof Measure.entries | typeof Measure.days | typeof Measure.sessions;
	readonly field?: undefined;
};

/** A goal of moving one number field's latest value to a target, like a goal weight. */
export interface TargetGoal {
	readonly type: typeof GoalType.target;
	readonly field: FieldKey;
	readonly target: number;
}

/** What a tracker aims for. */
export type Goal = FieldGoal | CountGoal | TargetGoal;

/** Raised when a goal does not fit its tracker's fields or kind. */
export class InvalidGoal {}

/** What a goal reads from a logged entry. */
export interface LoggedValues {
	readonly date: LocalDate;
	/** When it was logged, in epoch milliseconds, which orders entries within a day. */
	readonly loggedAt: number;
	readonly values: ReadonlyMap<FieldKey, FieldValue>;
}

/** A tracker's entries and sessions, the history a goal is measured against. */
export interface History {
	readonly entries: readonly LoggedValues[];
	readonly sessions: readonly Session[];
}

/** How far a tracker is toward its goal. */
export interface Progress {
	/** The current total, average, count, or latest value; undefined before any value of a target goal. */
	readonly value: number | undefined;
	/** How full its bar is, from 0 to 1. */
	readonly fill: number;
	/** Whether the goal is reached, or for "at most", not passed. */
	readonly met: boolean;
}

const COUNTABLE: readonly FieldType[] = [FieldType.number, FieldType.duration, FieldType.rating];

function targetFits(goal: Goal, field: Field | undefined): boolean {
	return field?.type !== FieldType.rating || goal.target <= MAX_STARS;
}

function isTarget(target: number): boolean {
	return Number.isFinite(target) && target > 0 && target <= MAX_NUMBER;
}

function sessionsFit(goal: Goal, kind: TrackerKind): boolean {
	return (
		goal.type === GoalType.target || goal.measure !== Measure.sessions || KIND_RULES[kind].sessions
	);
}

function fieldFits(goal: Goal, field: Field | undefined): boolean {
	if (goal.type === GoalType.target) return field?.type === FieldType.number;
	return goal.field === undefined || (field !== undefined && COUNTABLE.includes(field.type));
}

/**
 * Checks that a goal fits its tracker: a positive target, a total, average,
 * or target of a field that holds numbers (at most 5 for ratings), and
 * sessions only for kinds that have them.
 *
 * @param goal - The goal as entered.
 * @param fields - The tracker's fields.
 * @param kind - The tracker's kind.
 */
export function checkGoal(
	goal: Goal,
	fields: readonly Field[],
	kind: TrackerKind
): Result<Goal, InvalidGoal> {
	const field = fields.find((candidate) => candidate.key === goal.field);
	const valid =
		isTarget(goal.target) &&
		(goal.field === undefined || field !== undefined) &&
		fieldFits(goal, field) &&
		targetFits(goal, field) &&
		sessionsFit(goal, kind);
	return valid ? ok(goal) : err(new InvalidGoal());
}

/** Today and the day weeks begin on, which place the current period. */
export interface Calendar {
	readonly today: LocalDate;
	readonly weekStart: WeekStart;
}

/**
 * The first day of the current day, week, or month.
 *
 * @param period - The span.
 * @param calendar - Today and the week start.
 */
export function periodStart(period: Period, calendar: Calendar): LocalDate {
	const { today, weekStart } = calendar;
	if (period === Period.week) return startOfWeek(today, weekStart);
	return period === Period.month ? today.addDays(1 - today.day) : today;
}

/** A run of days, both ends included. */
export interface Span {
	readonly start: LocalDate;
	readonly end: LocalDate;
}

function within(date: LocalDate, span: Span): boolean {
	return !date.isBefore(span.start) && !span.end.isBefore(date);
}

/**
 * The numbers one field holds across entries, in their order.
 *
 * @param entries - Logged entries.
 * @param field - The field.
 */
export function fieldNumbers(
	entries: readonly LoggedValues[],
	field: FieldKey | undefined
): number[] {
	return entries.flatMap((entry) => {
		const amount = field === undefined ? undefined : numberOf(entry.values.get(field));
		return amount === undefined ? [] : [amount];
	});
}

/**
 * What a period goal counts over a span of days: entries, days with an entry,
 * finished sessions, or a field's total or average.
 *
 * @param goal - The period goal.
 * @param history - The tracker's entries and sessions.
 * @param span - The days to count.
 */
export function measureIn(goal: FieldGoal | CountGoal, history: History, span: Span): number {
	const entries = history.entries.filter((entry) => within(entry.date, span));
	if (goal.measure === Measure.entries) return entries.length;
	if (goal.measure === Measure.days)
		return new Set(entries.map((entry) => entry.date.toString())).size;
	if (goal.measure === Measure.sessions)
		return history.sessions.filter(
			(session) => session.state === SessionState.finished && within(session.date, span)
		).length;
	const numbers = fieldNumbers(entries, goal.field);
	const total = numbers.reduce((sum, amount) => sum + amount, 0);
	if (goal.measure === Measure.total) return total;
	return numbers.length === 0 ? 0 : total / numbers.length;
}

function clamp(fill: number): number {
	return Math.min(1, Math.max(0, fill));
}

/**
 * Orders entries by day, then by when they were logged.
 *
 * @param one - An entry.
 * @param other - Another entry.
 */
export function byDay(one: LoggedValues, other: LoggedValues): number {
	const days = one.date.compareTo(other.date);
	return days === 0 ? one.loggedAt - other.loggedAt : days;
}

function targetProgress(goal: TargetGoal, entries: readonly LoggedValues[]): Progress {
	const ordered = [...entries].sort((one, other) => byDay(one, other));
	const values = fieldNumbers(ordered, goal.field);
	const latest = last(values);
	const start = first(values);
	if (latest === undefined || start === undefined) return { value: undefined, fill: 0, met: false };
	const span = goal.target - start;
	if (span === 0) {
		const reached = latest === goal.target;
		return { value: latest, fill: reached ? 1 : 0, met: reached };
	}
	const moved = (latest - start) / span;
	return { value: latest, fill: clamp(moved), met: moved >= 1 };
}

/**
 * How far a tracker is toward its goal. A period goal counts entries, days,
 * finished sessions, or a field's total or average from the start of the
 * period through today, filling toward its target. A target goal fills from a
 * field's first value toward the target, by its latest value.
 *
 * @param goal - The tracker's goal.
 * @param history - The tracker's entries and sessions.
 * @param calendar - Today and the week start.
 */
export function progressOf(goal: Goal, history: History, calendar: Calendar): Progress {
	if (goal.type === GoalType.target) return targetProgress(goal, history.entries);
	const value = measureIn(goal, history, {
		start: periodStart(goal.period, calendar),
		end: calendar.today
	});
	const met = goal.direction === Direction.atMost ? value <= goal.target : value >= goal.target;
	return { value, fill: clamp(value / goal.target), met };
}
