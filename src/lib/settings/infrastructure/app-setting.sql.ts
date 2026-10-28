import type { SqlStatement } from '../../platform/db/sql.ts';

/** Keys of the `app_setting` table. */
export const SettingKey = { massUnit: 'mass_unit' } as const;

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
