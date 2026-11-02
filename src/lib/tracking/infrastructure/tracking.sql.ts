import type { SqlStatement } from '../../platform/db/sql.ts';
import type { EntryRow, SessionRow, SubjectRow, TrackerRow } from './tracking.row.ts';

/** The tables of the tracking context, named in corrupt-row errors. */
export const TrackingTable = {
	tracker: 'tracker',
	subject: 'subject',
	session: 'session',
	entry: 'entry'
} as const;

const TRACKER_COLUMNS = 'id, name, icon, kind, position, fields, goal';
const SUBJECT_COLUMNS = 'id, tracker_id, name, field_keys, defaults, archived, recipe';
const SESSION_COLUMNS = 'id, tracker_id, date, started_at, finished_at';
const ENTRY_COLUMNS = 'id, tracker_id, date, logged_at, subject_id, session_id, field_values';

/** Every tracker, in Home order. */
export const FIND_ALL_TRACKERS: SqlStatement = {
	name: 'find all trackers',
	sql: `SELECT ${TRACKER_COLUMNS} FROM tracker ORDER BY position, id`,
	params: []
};

/** @param id - The tracker. */
export function findTrackerById(id: string): SqlStatement {
	return {
		name: 'find tracker by id',
		sql: `SELECT ${TRACKER_COLUMNS} FROM tracker WHERE id = ?`,
		params: [id]
	};
}

/** @param row - The tracker to store, replacing an earlier version. */
export function saveTracker(row: TrackerRow): SqlStatement {
	return {
		name: 'save tracker',
		sql: `INSERT INTO tracker (${TRACKER_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET name = excluded.name, icon = excluded.icon,
			kind = excluded.kind, position = excluded.position, fields = excluded.fields,
			goal = excluded.goal`,
		params: [row.id, row.name, row.icon, row.kind, row.position, row.fields, row.goal]
	};
}

/** @param id - The tracker to remove with everything logged to it. */
export function deleteTracker(id: string): SqlStatement {
	return { name: 'delete tracker', sql: 'DELETE FROM tracker WHERE id = ?', params: [id] };
}

/** @param trackerId - The tracker whose library to list. */
export function findSubjectsFor(trackerId: string): SqlStatement {
	return {
		name: 'find subjects for tracker',
		sql: `SELECT ${SUBJECT_COLUMNS} FROM subject WHERE tracker_id = ? ORDER BY name COLLATE NOCASE, id`,
		params: [trackerId]
	};
}

/** @param id - The thing. */
export function findSubjectById(id: string): SqlStatement {
	return {
		name: 'find subject by id',
		sql: `SELECT ${SUBJECT_COLUMNS} FROM subject WHERE id = ?`,
		params: [id]
	};
}

/** @param row - The thing to store, replacing an earlier version. */
export function saveSubject(row: SubjectRow): SqlStatement {
	return {
		name: 'save subject',
		sql: `INSERT INTO subject (${SUBJECT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET name = excluded.name, field_keys = excluded.field_keys,
			defaults = excluded.defaults, archived = excluded.archived, recipe = excluded.recipe`,
		params: [
			row.id,
			row.tracker_id,
			row.name,
			row.field_keys,
			row.defaults,
			row.archived,
			row.recipe
		]
	};
}

/** @param trackerId - The tracker whose sessions to list, newest first. */
export function findSessionsFor(trackerId: string): SqlStatement {
	return {
		name: 'find sessions for tracker',
		sql: `SELECT ${SESSION_COLUMNS} FROM session WHERE tracker_id = ? ORDER BY started_at DESC, id DESC`,
		params: [trackerId]
	};
}

/** @param id - The session. */
export function findSessionById(id: string): SqlStatement {
	return {
		name: 'find session by id',
		sql: `SELECT ${SESSION_COLUMNS} FROM session WHERE id = ?`,
		params: [id]
	};
}

/**
 * Stores a session, or finishes a stored one. An upsert, not a replace, so the
 * session's entries are not deleted with the old row.
 *
 * @param row - The session to store.
 */
export function saveSession(row: SessionRow): SqlStatement {
	return {
		name: 'save session',
		sql: `INSERT INTO session (${SESSION_COLUMNS}) VALUES (?, ?, ?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET finished_at = excluded.finished_at`,
		params: [row.id, row.tracker_id, row.date, row.started_at, row.finished_at]
	};
}

/** @param id - The session to remove with its entries. */
export function deleteSession(id: string): SqlStatement {
	return { name: 'delete session', sql: 'DELETE FROM session WHERE id = ?', params: [id] };
}

/** @param date - The first day, as `YYYY-MM-DD`. */
export function findEntriesSince(date: string): SqlStatement {
	return {
		name: 'find entries since',
		sql: `SELECT ${ENTRY_COLUMNS} FROM entry WHERE date >= ? ORDER BY date, logged_at, id`,
		params: [date]
	};
}

/** @param trackerId - The tracker whose entries to list, oldest first. */
export function findEntriesFor(trackerId: string): SqlStatement {
	return {
		name: 'find entries for tracker',
		sql: `SELECT ${ENTRY_COLUMNS} FROM entry WHERE tracker_id = ? ORDER BY date, logged_at, id`,
		params: [trackerId]
	};
}

/** @param id - The entry. */
export function findEntryById(id: string): SqlStatement {
	return {
		name: 'find entry by id',
		sql: `SELECT ${ENTRY_COLUMNS} FROM entry WHERE id = ?`,
		params: [id]
	};
}

/** @param row - The entry to store, replacing one with the same id. */
export function saveEntry(row: EntryRow): SqlStatement {
	return {
		name: 'save entry',
		sql: `INSERT OR REPLACE INTO entry (${ENTRY_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		params: [
			row.id,
			row.tracker_id,
			row.date,
			row.logged_at,
			row.subject_id,
			row.session_id,
			row.field_values
		]
	};
}

/** @param id - The entry to remove. */
export function deleteEntry(id: string): SqlStatement {
	return { name: 'delete entry', sql: 'DELETE FROM entry WHERE id = ?', params: [id] };
}
