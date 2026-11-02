import { err, type Result } from '../../shared/result.ts';
import type { Field, FieldKey } from './field.ts';
import { checkGoal, InvalidGoal, type CountGoal, type Goal } from './goal.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	KIND_RULES,
	Measure,
	Period,
	SubjectUse,
	type TrackerKind
} from './tracking.constants.ts';

/** What a goal counts: days, times, workouts, a field's total or average, or a field's latest value. */
export type GoalMeasure = Measure | typeof GoalType.target;

/** A goal taken apart into the choices a person makes, such as "at least 2 h total a day". */
export interface GoalParts {
	readonly measure: GoalMeasure;
	/** The field a total, average, or target is of; undefined for counts. */
	readonly field: FieldKey | undefined;
	/** Ignored by a target, which has no period. */
	readonly period: Period;
	/** Ignored by a target, which is reached from either side. */
	readonly direction: Direction;
	readonly target: number;
}

const MEASURE_ORDER: readonly GoalMeasure[] = [
	Measure.days,
	Measure.entries,
	Measure.sessions,
	Measure.total,
	Measure.average,
	GoalType.target
];

const FIELD_TYPES: Partial<Record<GoalMeasure, readonly FieldType[]>> = {
	total: [FieldType.number, FieldType.duration],
	average: [FieldType.number, FieldType.duration, FieldType.rating],
	target: [FieldType.number]
};

/**
 * A goal any tracker can have: logging something on a number of days each week.
 *
 * @param target - How many days.
 */
export function daysAWeek(target: number): CountGoal {
	return {
		type: GoalType.period,
		measure: Measure.days,
		target,
		direction: Direction.atLeast,
		period: Period.week
	};
}

/**
 * Whether a goal is logging something each day, such as a weigh-in, so one
 * entry today fills its bar and there is no amount to choose.
 *
 * @param goal - The goal.
 */
export function isOnceADay(goal: Goal): boolean {
	return (
		goal.type === GoalType.period && goal.measure === Measure.days && goal.period === Period.day
	);
}

/**
 * What a goal counts.
 *
 * @param goal - The goal.
 */
export function measureOf(goal: Goal): GoalMeasure {
	return goal.type === GoalType.target ? GoalType.target : goal.measure;
}

/**
 * A goal's parts. A target goal gets "at least" and "a week", which only
 * show if the person switches it to a goal that has a period.
 *
 * @param goal - The goal.
 */
export function partsOf(goal: Goal): GoalParts {
	if (goal.type === GoalType.target)
		return { ...goal, measure: GoalType.target, period: Period.week, direction: Direction.atLeast };
	return { ...goal, field: goal.field };
}

/**
 * The tracker's fields a measure can be of: numbers and times for a total,
 * ratings too for an average, and a mass or distance for a target, like a
 * goal weight. None for a count.
 *
 * @param measure - What the goal counts.
 * @param fields - The tracker's fields.
 */
export function fieldsFor(measure: GoalMeasure, fields: readonly Field[]): readonly Field[] {
	const types = FIELD_TYPES[measure];
	if (types === undefined) return [];
	return fields.filter(
		(field) =>
			types.includes(field.type) &&
			(measure !== GoalType.target ||
				(field.type === FieldType.number && field.dimension !== Dimension.plain))
	);
}

/**
 * What a tracker's goal can count: days and times always, workouts for
 * trackers with sessions, a total or average when it has a field to measure,
 * and a target, like a goal weight, for a tracker without a library.
 *
 * @param fields - The tracker's fields.
 * @param kind - The tracker's kind.
 */
export function measuresFor(fields: readonly Field[], kind: TrackerKind): readonly GoalMeasure[] {
	return MEASURE_ORDER.filter((measure) => {
		if (measure === Measure.sessions) return KIND_RULES[kind].sessions;
		if (measure === GoalType.target && KIND_RULES[kind].subjects !== SubjectUse.none) return false;
		return FIELD_TYPES[measure] === undefined || fieldsFor(measure, fields).length > 0;
	});
}

function assembled(parts: GoalParts): Goal | undefined {
	const { measure, field, target, period, direction } = parts;
	if (measure === GoalType.target)
		return field === undefined ? undefined : { type: GoalType.target, field, target };
	const base = { type: GoalType.period, target, period, direction } as const;
	if (measure === Measure.total || measure === Measure.average)
		return field === undefined ? undefined : { ...base, measure, field };
	return { ...base, measure };
}

/**
 * Builds a goal from its parts and checks that it fits the tracker.
 *
 * @param parts - The choices made.
 * @param fields - The tracker's fields.
 * @param kind - The tracker's kind.
 */
export function goalFrom(
	parts: GoalParts,
	fields: readonly Field[],
	kind: TrackerKind
): Result<Goal, InvalidGoal> {
	const goal = assembled(parts);
	return goal === undefined ? err(new InvalidGoal()) : checkGoal(goal, fields, kind);
}
