import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { Combine, Direction, Measure, Period } from '../domain/tracker.constants.ts';
import {
	createTracker,
	isTrackerValue,
	type Tracker,
	type TrackerEntry
} from '../domain/tracker.ts';
import type { TrackerEntryRow, TrackerRow } from './tracker.row.ts';
import { TrackerTable } from './trackers.sql.ts';

const textOf = (value: unknown) => (typeof value === 'string' ? value : undefined);

const numberOf = (value: unknown) => (typeof value === 'number' ? value : undefined);

const oneOf =
	<T>(values: readonly T[]) =>
	(value: unknown): T | undefined =>
		values.find((candidate) => candidate === value);

const measureOf = oneOf(Object.values(Measure));
const directionOf = oneOf(Object.values(Direction));
const periodOf = oneOf(Object.values(Period));
const combineOf = oneOf(Object.values(Combine));

function idOf<Brand extends string>(value: unknown) {
	const parsed = typeof value === 'string' ? parseId<Brand>(value) : undefined;
	return parsed?.ok === true ? parsed.value : undefined;
}

function dateOf(value: unknown) {
	const parsed = typeof value === 'string' ? LocalDate.parse(value) : undefined;
	return parsed?.ok === true ? parsed.value : undefined;
}

function choicesOf(
	row: SqlRow
): Pick<Tracker, 'measure' | 'direction' | 'period' | 'combine'> | undefined {
	const [measure, direction] = [measureOf(row.measure), directionOf(row.direction)];
	const [period, combine] = [periodOf(row.period), combineOf(row.combine)];
	const known = measure !== undefined && direction !== undefined;
	return known && period !== undefined && combine !== undefined
		? { measure, direction, period, combine }
		: undefined;
}

function trackerFields(row: SqlRow): Tracker | undefined {
	const [id, name, unit] = [idOf<'Tracker'>(row.id), textOf(row.name), textOf(row.unit)];
	const [position, goal, choices] = [numberOf(row.position), numberOf(row.goal), choicesOf(row)];
	if (id === undefined || name === undefined || unit === undefined) return undefined;
	if (position === undefined || goal === undefined || choices === undefined) return undefined;
	return { id, name, unit, position, goal, subjectId: textOf(row.subject_id), ...choices };
}

function entryFields(row: SqlRow): TrackerEntry | undefined {
	const [id, trackerId] = [idOf<'TrackerEntry'>(row.id), idOf<'Tracker'>(row.tracker_id)];
	const [date, value] = [dateOf(row.date), numberOf(row.value) ?? 0];
	if (id === undefined || trackerId === undefined || date === undefined) return undefined;
	return isTrackerValue(value) ? { id, trackerId, date, value } : undefined;
}

/** Converts between trackers and `tracker` rows. */
export const trackerMapper = {
	/**
	 * Validates a stored row and builds the tracker it describes.
	 *
	 * @param row - A row selected with the columns of {@link TrackerRow}.
	 */
	toDomain(row: SqlRow): Result<Tracker, CorruptRow> {
		const fields = trackerFields(row);
		const tracker = fields === undefined ? undefined : createTracker(fields);
		return tracker?.ok === true
			? tracker
			: err(new CorruptRow(TrackerTable.tracker, CorruptReason.invalidValue));
	},

	/** @param tracker - The tracker to store. */
	toRow(tracker: Tracker): TrackerRow {
		const { subjectId, ...rest } = tracker;
		return { ...rest, subject_id: subjectId ?? null };
	}
};

/** Converts between logged values and `tracker_entry` rows. */
export const trackerEntryMapper = {
	/**
	 * Validates a stored row and builds the entry it describes.
	 *
	 * @param row - A row selected with the columns of {@link TrackerEntryRow}.
	 */
	toDomain(row: SqlRow): Result<TrackerEntry, CorruptRow> {
		const entry = entryFields(row);
		return entry === undefined
			? err(new CorruptRow(TrackerTable.entry, CorruptReason.invalidValue))
			: ok(entry);
	},

	/** @param entry - The entry to store. */
	toRow(entry: TrackerEntry): TrackerEntryRow {
		return {
			id: entry.id,
			tracker_id: entry.trackerId,
			date: entry.date.toString(),
			value: entry.value
		};
	}
};
