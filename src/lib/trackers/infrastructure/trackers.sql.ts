import type { SqlStatement } from '../../platform/db/sql.ts';
import type { TrackerEntryRow, TrackerRow } from './tracker.row.ts';

/** Table names, for error messages about corrupt rows. */
export const TrackerTable = {
	tracker: 'tracker',
	entry: 'tracker_entry'
} as const;

const TRACKER_COLUMNS =
	'id, name, position, measure, subject_id, unit, goal, direction, period, combine';
const ENTRY_COLUMNS = 'id, tracker_id, date, value';

/** Lists every tracker in Home order. */
export const FIND_ALL_TRACKERS: SqlStatement = {
	name: 'find all trackers',
	sql: `SELECT ${TRACKER_COLUMNS} FROM tracker ORDER BY position, id`,
	params: []
};

/** Finds a tracker by id. */
export function findTrackerById(id: string): SqlStatement {
	return {
		name: 'find tracker',
		sql: `SELECT ${TRACKER_COLUMNS} FROM tracker WHERE id = ?`,
		params: [id]
	};
}

/** Inserts a tracker, or updates the one with the same id. */
export function saveTracker(row: TrackerRow): SqlStatement {
	return {
		name: 'save tracker',
		sql: `INSERT INTO tracker (${TRACKER_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET name = excluded.name, position = excluded.position,
			measure = excluded.measure, subject_id = excluded.subject_id, unit = excluded.unit,
			goal = excluded.goal, direction = excluded.direction, period = excluded.period,
			combine = excluded.combine`,
		params: [
			row.id,
			row.name,
			row.position,
			row.measure,
			row.subject_id,
			row.unit,
			row.goal,
			row.direction,
			row.period,
			row.combine
		]
	};
}

/** Deletes a tracker; its entries go with it. */
export function deleteTracker(id: string): SqlStatement {
	return { name: 'delete tracker', sql: 'DELETE FROM tracker WHERE id = ?', params: [id] };
}

/** Lists entries on or after a day, oldest first. */
export function findTrackerEntriesSince(date: string): SqlStatement {
	return {
		name: 'find tracker entries since',
		sql: `SELECT ${ENTRY_COLUMNS} FROM tracker_entry WHERE date >= ? ORDER BY date, id`,
		params: [date]
	};
}

/** Lists a tracker's latest entries, newest first. */
export function findLatestTrackerEntries(trackerId: string, limit: number): SqlStatement {
	return {
		name: 'find latest tracker entries',
		sql: `SELECT ${ENTRY_COLUMNS} FROM tracker_entry WHERE tracker_id = ?
			ORDER BY date DESC, id DESC LIMIT ?`,
		params: [trackerId, limit]
	};
}

/** Inserts an entry, or replaces the one with the same id. */
export function saveTrackerEntry(row: TrackerEntryRow): SqlStatement {
	return {
		name: 'save tracker entry',
		sql: `INSERT OR REPLACE INTO tracker_entry (${ENTRY_COLUMNS}) VALUES (?, ?, ?, ?)`,
		params: [row.id, row.tracker_id, row.date, row.value]
	};
}

/** Deletes an entry. */
export function deleteTrackerEntry(id: string): SqlStatement {
	return {
		name: 'delete tracker entry',
		sql: 'DELETE FROM tracker_entry WHERE id = ?',
		params: [id]
	};
}

/** Whether the starting trackers were made. */
export const FIND_TRACKER_SETUP: SqlStatement = {
	name: 'find tracker setup',
	sql: 'SELECT id FROM tracker_setup',
	params: []
};

/** Records that the starting trackers were made. */
export const MARK_TRACKERS_SEEDED: SqlStatement = {
	name: 'mark trackers seeded',
	sql: 'INSERT OR IGNORE INTO tracker_setup (id) VALUES (1)',
	params: []
};
