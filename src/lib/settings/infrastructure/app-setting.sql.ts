import type { SqlStatement } from '../../platform/db/sql.ts';

/** Keys of the `app_setting` table. */
export const SettingKey = {
	massUnit: 'mass_unit',
	lastExportAt: 'last_export_at',
	setupComplete: 'setup_complete',
	weekStart: 'week_start',
	installHintDismissed: 'install_hint_dismissed',
	theme: 'theme',
	distanceUnit: 'distance_unit',
	restSeconds: 'rest_seconds'
} as const;

/** One of the {@link SettingKey} values. */
export type SettingKey = (typeof SettingKey)[keyof typeof SettingKey];

/** Reads one setting. */
export function readSetting(key: SettingKey): SqlStatement {
	return {
		name: 'read setting',
		sql: 'SELECT value FROM app_setting WHERE key = ?',
		params: [key]
	};
}

/** Stores one setting, replacing its earlier value. */
export function writeSetting(key: SettingKey, value: string): SqlStatement {
	return {
		name: 'write setting',
		sql: 'INSERT OR REPLACE INTO app_setting (key, value) VALUES (?, ?)',
		params: [key, value]
	};
}

/**
 * Reads several settings at once.
 *
 * @param keys - The settings to read; missing ones return no row.
 */
export function readSettings(keys: readonly SettingKey[]): SqlStatement {
	return {
		name: 'read settings',
		sql: `SELECT key, value FROM app_setting WHERE key IN (${keys.map(() => '?').join(', ')})`,
		params: keys
	};
}

/** The columns of {@link COUNT_RECORDS}. */
export const CountColumn = {
	trackers: 'trackers',
	entries: 'entries',
	photos: 'photos'
} as const;

/** Counts the records a restore or deletion would remove. */
export const COUNT_RECORDS: SqlStatement = {
	name: 'count records',
	sql: `SELECT (SELECT count(*) FROM tracker) AS trackers,
		(SELECT count(*) FROM entry) AS entries,
		(SELECT count(*) FROM entry, json_each(entry.field_values)
			WHERE json_extract(json_each.value, '$.type') = 'photo') AS photos`,
	params: []
};
