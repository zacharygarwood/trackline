import { messages } from '../../i18n/messages.en.ts';
import { formatClock } from '../../ui/format.ts';
import type { Entry } from '../domain/entry.ts';
import type { Field, FieldValue, NumberField } from '../domain/field.ts';
import type { Goal } from '../domain/goal.ts';
import type { Tracker } from '../domain/tracker.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	Measure
} from '../domain/tracking.constants.ts';
import { toShown, unitText, type DisplayUnits } from './display-units.ts';
import { DISTANCE_FORMAT, NUMBER_FORMAT } from './value-format.constants.ts';

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const numberFormat = new Intl.NumberFormat(undefined, NUMBER_FORMAT);
const distanceFormat = new Intl.NumberFormat(undefined, DISTANCE_FORMAT);

/**
 * A number for lists and Home, such as "2,000" or "80.4".
 *
 * @param amount - The number.
 */
export function formatNumber(amount: number): string {
	return numberFormat.format(amount);
}

/**
 * A duration in words: "45 s" under a minute, "25 min" under an hour, else "7 h 30 min".
 *
 * @param seconds - The duration.
 */
export function formatDuration(seconds: number): string {
	const whole = Math.round(seconds);
	if (whole < SECONDS_PER_MINUTE) return messages.tracking.values.seconds(whole);
	const minutes = Math.round(whole / SECONDS_PER_MINUTE);
	if (minutes < MINUTES_PER_HOUR) return messages.tracking.values.minutes(minutes);
	return messages.tracking.values.hours(
		Math.floor(minutes / MINUTES_PER_HOUR),
		minutes % MINUTES_PER_HOUR
	);
}

/**
 * A stored number in the user's units with its unit, such as "8 glasses" or "176.4 lb".
 *
 * @param field - The number's field.
 * @param stored - The stored amount.
 * @param units - The user's units.
 */
export function formatAmount(field: NumberField, stored: number, units: DisplayUnits): string {
	const shown = toShown(field, stored, units);
	const text =
		field.dimension === Dimension.distance ? distanceFormat.format(shown) : formatNumber(shown);
	return messages.tracking.values.amount(text, unitText(field, units));
}

function formatMeasured(field: Field, value: FieldValue, units: DisplayUnits): string | undefined {
	if (value.type === FieldType.number)
		return field.type === FieldType.number
			? formatAmount(field, value.amount, units)
			: formatNumber(value.amount);
	if (value.type === FieldType.duration) return formatDuration(value.seconds);
	return value.type === FieldType.rating ? messages.tracking.values.stars(value.stars) : undefined;
}

/**
 * One logged value in words.
 *
 * @param field - The value's field.
 * @param value - The value.
 * @param units - The user's units.
 */
export function formatValue(field: Field, value: FieldValue, units: DisplayUnits): string {
	if (value.type === FieldType.check) return messages.tracking.values.done;
	if (value.type === FieldType.choice) return value.option;
	if (value.type === FieldType.note) return value.text;
	if (value.type === FieldType.photo) return messages.tracking.values.photo;
	return formatMeasured(field, value, units) ?? '';
}

function distanceIn(tracker: Tracker, values: Entry['values']) {
	const field = tracker.fields.find(
		(candidate): candidate is NumberField =>
			candidate.type === FieldType.number && candidate.dimension === Dimension.distance
	);
	const value = field === undefined ? undefined : values.get(field.key);
	return field === undefined || value?.type !== FieldType.number
		? undefined
		: { field, amount: value.amount };
}

function secondsIn(tracker: Tracker, values: Entry['values']): number | undefined {
	const field = tracker.fields.find((candidate) => candidate.type === FieldType.duration);
	const value = field === undefined ? undefined : values.get(field.key);
	return value?.type === FieldType.duration ? value.seconds : undefined;
}

function paceOf(
	tracker: Tracker,
	values: Entry['values'],
	units: DisplayUnits
): string | undefined {
	const [distance, seconds] = [distanceIn(tracker, values), secondsIn(tracker, values)];
	if (distance === undefined || seconds === undefined) return undefined;
	const shown = toShown(distance.field, distance.amount, units);
	return shown > 0
		? messages.tracking.values.pace(formatClock(seconds / shown), units.distance)
		: undefined;
}

/**
 * An entry in one line: its values in the tracker's field order, then the
 * pace when it has a distance and a time. Notes show only when nothing else does.
 *
 * @param tracker - The entry's tracker.
 * @param values - The entry's values.
 * @param units - The user's units.
 */
export function entrySummary(
	tracker: Tracker,
	values: Entry['values'],
	units: DisplayUnits
): string {
	const parts = tracker.fields.flatMap((field) => {
		const value = values.get(field.key);
		return value === undefined || value.type === FieldType.note
			? []
			: [formatValue(field, value, units)];
	});
	const pace = paceOf(tracker, values, units);
	const all = pace === undefined ? parts : [...parts, pace];
	if (all.length > 0) return messages.tracking.values.join(all);
	const note = [...values.values()].find((value) => value.type === FieldType.note);
	return note?.type === FieldType.note ? note.text : '';
}

/** What a goal's text needs from its tracker: the fields and the goal. */
export type GoalOwner = Pick<Tracker, 'fields' | 'goal'>;

/** What a goal's amounts are counted in: the tracker's fields, its goal, and the user's units. */
interface GoalTerms {
	readonly tracker: GoalOwner;
	readonly goal: Goal;
	readonly units: DisplayUnits;
}

function countText(measure: Measure, amount: number): string {
	const count = Math.round(amount);
	if (measure === Measure.days) return messages.tracking.counts.days(count);
	if (measure === Measure.sessions) return messages.tracking.counts.sessions(count);
	return messages.tracking.counts.entries(count);
}

function goalAmount(terms: GoalTerms, amount: number): string {
	const { tracker, goal, units } = terms;
	if (goal.type === GoalType.period && goal.field === undefined)
		return countText(goal.measure, amount);
	const field = tracker.fields.find((candidate) => candidate.key === goal.field);
	if (field === undefined) return formatNumber(amount);
	const value: FieldValue =
		field.type === FieldType.duration
			? { type: FieldType.duration, seconds: amount }
			: { type: FieldType.number, amount };
	return field.type === FieldType.rating
		? messages.tracking.values.stars(amount)
		: formatValue(field, value, units);
}

/**
 * A tracker's goal in words, such as "8 glasses a day", "At most 3 cups a day", or "Goal 75 kg".
 *
 * @param tracker - The tracker.
 * @param units - The user's units.
 */
export function goalText(tracker: GoalOwner, units: DisplayUnits): string {
	const { goal } = tracker;
	const amount = goalAmount({ tracker, goal, units }, goal.target);
	if (goal.type === GoalType.target) return messages.tracking.goal.target(amount);
	const period = messages.tracking.periods[goal.period];
	return goal.direction === Direction.atMost
		? messages.tracking.goal.atMost(amount, period)
		: messages.tracking.goal.atLeast(amount, period);
}

/**
 * How far a tracker is, in its goal's terms, such as "5 glasses" or "2 workouts".
 *
 * @param tracker - The tracker.
 * @param value - Its current total, average, count, or latest value.
 * @param units - The user's units.
 */
export function progressText(tracker: GoalOwner, value: number, units: DisplayUnits): string {
	return goalAmount({ tracker, goal: tracker.goal, units }, value);
}

/**
 * What Home shows after a tracker's number: "/ 8 glasses a day", or "Goal 75 kg".
 *
 * @param tracker - The tracker.
 * @param units - The user's units.
 */
export function goalDetail(tracker: GoalOwner, units: DisplayUnits): string {
	const text = goalText(tracker, units);
	return tracker.goal.type === GoalType.period ? messages.tracking.goal.of(text) : text;
}
