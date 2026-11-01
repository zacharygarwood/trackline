import type { Id } from '../../shared/id.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { startOfWeek } from '../../shared/week.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import {
	Combine,
	Direction,
	Measure,
	MEASURES_BY_SOURCE,
	Period,
	SUBJECT_MEASURES,
	TrackerField,
	TrackerSource
} from './tracker.constants.ts';

/** The longest name a tracker can have. */
export const MAX_TRACKER_NAME_LENGTH = 40;

/** The longest unit label a tracker can have. */
export const MAX_TRACKER_UNIT_LENGTH = 20;

/** The largest goal or logged value a tracker accepts. */
export const MAX_TRACKER_VALUE = 1_000_000;

/** The best rating a rating tracker records. */
export const MAX_RATING = 5;

/** Identifies one tracker. */
export type TrackerId = Id<'Tracker'>;

/** Identifies one value logged to a tracker. */
export type TrackerEntryId = Id<'TrackerEntry'>;

/**
 * Something the user tracks on Home: a measure from the food log, workouts,
 * weigh-ins, or their own log, a goal, and whether it counts per day or week.
 */
export interface Tracker {
	readonly id: TrackerId;
	readonly name: string;
	/** Where it appears on Home, starting at 0. */
	readonly position: number;
	readonly measure: Measure;
	/** The food or exercise measured, for measures of one food or exercise. */
	readonly subjectId: string | undefined;
	/** The unit of a number the user logs, such as "glasses", or of the chosen food; empty otherwise. */
	readonly unit: string;
	/** The value to reach or stay under. Distances are in metres, times in minutes, weight in kilograms. */
	readonly goal: number;
	readonly direction: Direction;
	readonly period: Period;
	/** How logged entries combine in a period; totals for every other measure. */
	readonly combine: Combine;
}

/** A value the user logged to one of their own trackers on a day. */
export interface TrackerEntry {
	readonly id: TrackerEntryId;
	readonly trackerId: TrackerId;
	readonly date: LocalDate;
	readonly value: number;
}

/** Raised when a tracker's name, unit, goal, or chosen food or exercise is invalid. */
export class InvalidTracker {
	/** @param field - The field that was rejected. */
	constructor(readonly field: TrackerField) {}
}

/** Raised when a logged value is not usable for its tracker. */
export class InvalidEntryValue {
	/** @param value - The rejected value. */
	constructor(readonly value: number) {}
}

/**
 * Where a measure's numbers come from.
 *
 * @param measure - The measure.
 */
export function sourceOf(measure: Measure): TrackerSource {
	const sources = Object.values(TrackerSource);
	return (
		sources.find((source) =>
			MEASURES_BY_SOURCE[source].some((candidate) => candidate === measure)
		) ?? TrackerSource.log
	);
}

/**
 * Whether a measure reads one chosen food or exercise.
 *
 * @param measure - The measure.
 */
export function needsSubject(measure: Measure): boolean {
	return SUBJECT_MEASURES.includes(measure);
}

/**
 * How a measure's values combine: ratings average, done counts days, other
 * logged numbers as chosen, and everything else totals.
 *
 * @param measure - The measure.
 * @param chosen - The combination picked for a logged number or duration.
 */
export function combineFor(measure: Measure, chosen: Combine): Combine {
	if (measure === Measure.rating) return Combine.average;
	if (measure === Measure.done) return Combine.days;
	return measure === Measure.number || measure === Measure.duration ? chosen : Combine.total;
}

/**
 * Whether a value can be a goal or a logged amount: above 0 and at most a million.
 *
 * @param value - The number.
 */
export function isTrackerValue(value: number): boolean {
	return Number.isFinite(value) && value > 0 && value <= MAX_TRACKER_VALUE;
}

function checkFields(fields: Tracker, name: string, unit: string): InvalidTracker | undefined {
	if (name === '' || name.length > MAX_TRACKER_NAME_LENGTH)
		return new InvalidTracker(TrackerField.name);
	if (unit.length > MAX_TRACKER_UNIT_LENGTH) return new InvalidTracker(TrackerField.unit);
	if (!isTrackerValue(fields.goal)) return new InvalidTracker(TrackerField.goal);
	const hasSubject = fields.subjectId !== undefined && fields.subjectId !== '';
	return hasSubject === needsSubject(fields.measure)
		? undefined
		: new InvalidTracker(TrackerField.subject);
}

/**
 * Creates a tracker: trims its name and unit, checks its goal and chosen food
 * or exercise, and settles how its values combine. Weight is always a single
 * value, so its period is a day.
 *
 * @param fields - The tracker as entered.
 */
export function createTracker(fields: Tracker): Result<Tracker, InvalidTracker> {
	const name = fields.name.trim().replace(/\s+/g, ' ');
	const keepsUnit = fields.measure === Measure.number || fields.measure === Measure.food;
	const unit = keepsUnit ? fields.unit.trim() : '';
	const problem = checkFields(fields, name, unit);
	if (problem !== undefined) return err(problem);
	const goal = fields.measure === Measure.rating ? Math.min(fields.goal, MAX_RATING) : fields.goal;
	return ok({
		...fields,
		name,
		unit,
		goal,
		subjectId: needsSubject(fields.measure) ? fields.subjectId : undefined,
		period: fields.measure === Measure.weight ? Period.day : fields.period,
		combine: combineFor(fields.measure, fields.combine)
	});
}

/**
 * Checks a value logged to a tracker: ratings are whole numbers from 1 to 5,
 * done is always 1, and other values are above 0.
 *
 * @param tracker - The tracker.
 * @param value - The value as entered.
 */
export function checkEntryValue(
	tracker: Tracker,
	value: number
): Result<number, InvalidEntryValue> {
	if (tracker.measure === Measure.done) return ok(1);
	const valid =
		tracker.measure === Measure.rating
			? Number.isInteger(value) && value >= 1 && value <= MAX_RATING
			: isTrackerValue(value);
	return valid ? ok(value) : err(new InvalidEntryValue(value));
}

/**
 * The first day of the tracker's current day or week.
 *
 * @param period - Daily or weekly.
 * @param today - Today's date.
 * @param weekStart - The day weeks begin on.
 */
export function periodStart(period: Period, today: LocalDate, weekStart: WeekStart): LocalDate {
	return period === Period.week ? startOfWeek(today, weekStart) : today;
}

/**
 * One number for a logged tracker's entries in its current period.
 *
 * @param tracker - The tracker.
 * @param entries - Entries of any trackers, on any days.
 * @param start - The first day of the period, from {@link periodStart}.
 */
export function combineEntries(
	tracker: Tracker,
	entries: readonly TrackerEntry[],
	start: LocalDate
): number {
	const values = entries.filter(
		(entry) => entry.trackerId === tracker.id && !entry.date.isBefore(start)
	);
	if (tracker.combine === Combine.days) {
		return new Set(values.map((entry) => entry.date.toString())).size;
	}
	const total = values.reduce((sum, entry) => sum + entry.value, 0);
	if (tracker.combine === Combine.total) return total;
	return values.length === 0 ? 0 : total / values.length;
}

/**
 * How full a tracker's bar is, from 0 to 1. Weight fills from the first
 * weigh-in toward the target; everything else fills toward its goal.
 *
 * @param tracker - The tracker.
 * @param value - Its current value.
 * @param startWeight - The first weigh-in, for weight trackers.
 */
export function fillOf(tracker: Tracker, value: number, startWeight?: number): number {
	if (tracker.measure !== Measure.weight) return Math.min(1, Math.max(0, value / tracker.goal));
	const start = startWeight ?? value;
	const span = tracker.goal - start;
	if (span === 0) return value === tracker.goal ? 1 : 0;
	return Math.min(1, Math.max(0, (value - start) / span));
}

/**
 * Whether a tracker is within its goal: reached for "at least", not passed for "at most".
 *
 * @param tracker - The tracker.
 * @param value - Its current value.
 */
export function meetsGoal(tracker: Tracker, value: number): boolean {
	return tracker.direction === Direction.atMost ? value <= tracker.goal : value >= tracker.goal;
}
