import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { Entry } from '../domain/entry.ts';
import type { Session } from '../domain/session.ts';
import type { Subject } from '../domain/subject.ts';
import { createTracker, tidyName, type Tracker } from '../domain/tracker.ts';
import {
	SessionState,
	TrackerIcon,
	TrackerKind,
	type TrackerIcon as Icon
} from '../domain/tracking.constants.ts';
import { fieldDraftsOf, fieldKeysOf, goalOf, valuesJson, valuesOf } from './tracking-json.ts';
import type { EntryRow, SessionRow, SubjectRow, TrackerRow } from './tracking.row.ts';
import { TrackingTable } from './tracking.sql.ts';

const textOf = (value: unknown) => (typeof value === 'string' ? value : undefined);
const numberOf = (value: unknown) => (typeof value === 'number' ? value : undefined);

const oneOf =
	<T>(values: readonly T[]) =>
	(value: unknown): T | undefined =>
		values.find((candidate) => candidate === value);

const iconOf = oneOf<Icon>(Object.values(TrackerIcon));
const kindOf = oneOf(Object.values(TrackerKind));

function idOf<Brand extends string>(value: unknown) {
	const parsed = typeof value === 'string' ? parseId<Brand>(value) : undefined;
	return parsed?.ok === true ? parsed.value : undefined;
}

function dateOf(value: unknown) {
	const parsed = typeof value === 'string' ? LocalDate.parse(value) : undefined;
	return parsed?.ok === true ? parsed.value : undefined;
}

function parsedOf<T>(value: unknown, parse: (text: string) => T | undefined): T | undefined {
	return typeof value === 'string' ? parse(value) : undefined;
}

function corrupt(table: string): CorruptRow {
	return new CorruptRow(table, CorruptReason.invalidValue);
}

function trackerLook(row: SqlRow): Pick<Tracker, 'id' | 'name' | 'icon' | 'kind'> | undefined {
	const [id, name, icon, kind] = [
		idOf<'Tracker'>(row.id),
		textOf(row.name),
		iconOf(row.icon),
		kindOf(row.kind)
	];
	if (id === undefined || name === undefined || icon === undefined) return undefined;
	return kind === undefined ? undefined : { id, name, icon, kind };
}

function trackerOf(row: SqlRow): Tracker | undefined {
	const [look, position] = [trackerLook(row), numberOf(row.position)];
	const fields = parsedOf(row.fields, fieldDraftsOf);
	const goal = parsedOf(row.goal, goalOf);
	if (look === undefined || position === undefined || fields === undefined || goal === undefined)
		return undefined;
	const tracker = createTracker({ ...look, position, fields, goal });
	return tracker.ok ? tracker.value : undefined;
}

/** Converts between trackers and `tracker` rows. */
export const trackerMapper = {
	/**
	 * Validates a stored row and builds the tracker it describes.
	 *
	 * @param row - A row selected with the columns of {@link TrackerRow}.
	 */
	toDomain(row: SqlRow): Result<Tracker, CorruptRow> {
		const tracker = trackerOf(row);
		return tracker === undefined ? err(corrupt(TrackingTable.tracker)) : ok(tracker);
	},

	/** @param tracker - The tracker to store. */
	toRow(tracker: Tracker): TrackerRow {
		const { id, name, icon, kind, position, fields, goal } = tracker;
		return {
			id,
			name,
			icon,
			kind,
			position,
			fields: JSON.stringify(fields),
			goal: JSON.stringify(goal)
		};
	}
};

function flagOf(value: unknown): boolean | undefined {
	if (value === 1) return true;
	return value === 0 ? false : undefined;
}

function subjectOf(row: SqlRow): Subject | undefined {
	const [id, trackerId] = [idOf<'Subject'>(row.id), idOf<'Tracker'>(row.tracker_id)];
	const name = tidyName(textOf(row.name) ?? '');
	const fieldKeys = parsedOf(row.field_keys, fieldKeysOf);
	const defaults = parsedOf(row.defaults, valuesOf);
	if (id === undefined || trackerId === undefined || name === undefined) return undefined;
	if (fieldKeys === undefined || defaults === undefined) return undefined;
	const archived = flagOf(row.archived);
	return archived === undefined
		? undefined
		: { id, trackerId, name, fieldKeys, defaults, archived };
}

/** Converts between the things in libraries and `subject` rows. */
export const subjectMapper = {
	/**
	 * Validates a stored row and builds the thing it describes.
	 *
	 * @param row - A row selected with the columns of {@link SubjectRow}.
	 */
	toDomain(row: SqlRow): Result<Subject, CorruptRow> {
		const subject = subjectOf(row);
		return subject === undefined ? err(corrupt(TrackingTable.subject)) : ok(subject);
	},

	/** @param subject - The thing to store. */
	toRow(subject: Subject): SubjectRow {
		return {
			id: subject.id,
			tracker_id: subject.trackerId,
			name: subject.name,
			field_keys: JSON.stringify(subject.fieldKeys),
			defaults: valuesJson(subject.defaults),
			archived: subject.archived ? 1 : 0
		};
	}
};

function sessionOf(row: SqlRow): Session | undefined {
	const [id, trackerId, date] = [
		idOf<'Session'>(row.id),
		idOf<'Tracker'>(row.tracker_id),
		dateOf(row.date)
	];
	const [startedAt, finishedAt] = [numberOf(row.started_at), numberOf(row.finished_at)];
	if (id === undefined || trackerId === undefined || date === undefined || startedAt === undefined)
		return undefined;
	const started = { id, trackerId, date, startedAt };
	if (row.finished_at === null) return { ...started, state: SessionState.active };
	return finishedAt === undefined || finishedAt < startedAt
		? undefined
		: { ...started, state: SessionState.finished, finishedAt };
}

/** Converts between sessions and `session` rows. */
export const sessionMapper = {
	/**
	 * Validates a stored row and builds the session it describes.
	 *
	 * @param row - A row selected with the columns of {@link SessionRow}.
	 */
	toDomain(row: SqlRow): Result<Session, CorruptRow> {
		const session = sessionOf(row);
		return session === undefined ? err(corrupt(TrackingTable.session)) : ok(session);
	},

	/** @param session - The session to store. */
	toRow(session: Session): SessionRow {
		return {
			id: session.id,
			tracker_id: session.trackerId,
			date: session.date.toString(),
			started_at: session.startedAt,
			finished_at: session.state === SessionState.finished ? session.finishedAt : null
		};
	}
};

function optionalIdOf<Brand extends string>(
	value: unknown
): { id: ReturnType<typeof idOf<Brand>> } | undefined {
	if (value === null) return { id: undefined };
	const id = idOf<Brand>(value);
	return id === undefined ? undefined : { id };
}

function entryLinks(row: SqlRow): Pick<Entry, 'subjectId' | 'sessionId'> | undefined {
	const [subject, session] = [
		optionalIdOf<'Subject'>(row.subject_id),
		optionalIdOf<'Session'>(row.session_id)
	];
	return subject === undefined || session === undefined
		? undefined
		: { subjectId: subject.id, sessionId: session.id };
}

function entryOf(row: SqlRow): Entry | undefined {
	const [id, trackerId, date] = [
		idOf<'Entry'>(row.id),
		idOf<'Tracker'>(row.tracker_id),
		dateOf(row.date)
	];
	const [links, loggedAt, values] = [
		entryLinks(row),
		numberOf(row.logged_at),
		parsedOf(row.field_values, valuesOf)
	];
	if (id === undefined || trackerId === undefined || date === undefined) return undefined;
	if (links === undefined || loggedAt === undefined || values === undefined) return undefined;
	return values.size === 0 ? undefined : { id, trackerId, date, loggedAt, ...links, values };
}

/** Converts between entries and `entry` rows. */
export const entryMapper = {
	/**
	 * Validates a stored row and builds the entry it describes.
	 *
	 * @param row - A row selected with the columns of {@link EntryRow}.
	 */
	toDomain(row: SqlRow): Result<Entry, CorruptRow> {
		const entry = entryOf(row);
		return entry === undefined ? err(corrupt(TrackingTable.entry)) : ok(entry);
	},

	/** @param entry - The entry to store. */
	toRow(entry: Entry): EntryRow {
		return {
			id: entry.id,
			tracker_id: entry.trackerId,
			date: entry.date.toString(),
			logged_at: entry.loggedAt,
			subject_id: entry.subjectId ?? null,
			session_id: entry.sessionId ?? null,
			field_values: valuesJson(entry.values)
		};
	}
};
