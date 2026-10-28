import type { SqlStatement } from '../../platform/db/sql.ts';

/** Keys of the `app_setting` table. */
export const SettingKey = {
	massUnit: 'mass_unit',
	lastExportAt: 'last_export_at',
	setupComplete: 'setup_complete'
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

/** Counts the records a restore or deletion would remove. */
export const COUNT_RECORDS: SqlStatement = {
	name: 'count records',
	sql: 'SELECT (SELECT count(*) FROM weigh_in) AS weigh_ins',
	params: []
};
