import type { SqlStatement } from '../../platform/db/sql.ts';

/** Keys of the `app_setting` table. */
export const SettingKey = {
	massUnit: 'mass_unit',
	lastExportAt: 'last_export_at',
	setupComplete: 'setup_complete',
	weekStart: 'week_start',
	installHintDismissed: 'install_hint_dismissed',
	theme: 'theme',
	accent: 'accent',
	trackCarbsAndFat: 'track_carbs_and_fat',
	distanceUnit: 'distance_unit',
	newFoodUnit: 'new_food_unit',
	restSeconds: 'rest_seconds',
	weeklyWorkoutGoal: 'weekly_workout_goal'
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
	weighIns: 'weigh_ins',
	workouts: 'workouts',
	foodEntries: 'food_entries',
	photos: 'photos'
} as const;

/** Counts the records a restore or deletion would remove. */
export const COUNT_RECORDS: SqlStatement = {
	name: 'count records',
	sql: `SELECT (SELECT count(*) FROM weigh_in) AS weigh_ins,
		(SELECT count(*) FROM workout WHERE finished_at IS NOT NULL) AS workouts,
		(SELECT count(*) FROM food_log_entry) AS food_entries,
		(SELECT count(*) FROM progress_photo) AS photos`,
	params: []
};
