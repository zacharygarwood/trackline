import type { SettingKey } from './app-setting.sql.ts';

/** One row of the `app_setting` table that holds a preference. */
export type PreferenceRow = {
	readonly key: SettingKey;
	readonly value: string;
};
