import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { Theme } from '../domain/preferences.constants.ts';
import { REST_TIMER_SECONDS, type Preferences } from '../domain/preferences.ts';
import { SettingKey } from './app-setting.sql.ts';
import type { PreferenceRow } from './preference.row.ts';

const TABLE = 'app_setting';
/** The `app_setting` keys that hold preferences. */
export const PREFERENCE_SETTINGS = [
	SettingKey.theme,
	SettingKey.distanceUnit,
	SettingKey.restSeconds
] as const;

const oneOf =
	<T>(values: readonly T[]) =>
	(text: string): T | undefined =>
		values.find((value) => String(value) === text);

type Field<K extends keyof Preferences> = Result<Partial<Pick<Preferences, K>>, CorruptRow>;

function field<K extends keyof Preferences>(
	rows: readonly SqlRow[],
	key: K,
	parse: (text: string) => Preferences[K] | undefined
): Field<K> {
	const setting = SETTING_OF[key];
	const text = rows.find((row) => row.key === setting)?.value;
	if (text === undefined) return ok({});
	const value = typeof text === 'string' ? parse(text) : undefined;
	if (value === undefined) return err(new CorruptRow(TABLE, CorruptReason.invalidValue));
	const parsed: Partial<Pick<Preferences, K>> = {};
	parsed[key] = value;
	return ok(parsed);
}

const SETTING_OF: Readonly<Record<keyof Preferences, SettingKey>> = {
	theme: SettingKey.theme,
	distanceUnit: SettingKey.distanceUnit,
	restSeconds: SettingKey.restSeconds
};

/** Converts `app_setting` rows to preferences and back. */
export const PreferencesMapper = {
	/**
	 * Reads stored preferences.
	 *
	 * @param rows - Rows of the {@link PREFERENCE_SETTINGS} that are set.
	 */
	toDomain(rows: readonly SqlRow[]): Result<Partial<Preferences>, CorruptRow> {
		const fields = [
			field(rows, 'theme', oneOf(Object.values(Theme))),
			field(rows, 'distanceUnit', oneOf(Object.values(DistanceUnit))),
			field(rows, 'restSeconds', oneOf(REST_TIMER_SECONDS))
		];
		let preferences: Partial<Preferences> = {};
		for (const parsed of fields) {
			if (!parsed.ok) return parsed;
			preferences = { ...preferences, ...parsed.value };
		}
		return ok(preferences);
	},

	/**
	 * Rows for the given preferences.
	 *
	 * @param changes - The preferences to store.
	 */
	toRows(changes: Partial<Preferences>): readonly PreferenceRow[] {
		const keys = Object.keys(SETTING_OF).filter((key): key is keyof Preferences => key in changes);
		return keys.flatMap((key) => {
			const value = changes[key];
			return value === undefined ? [] : [{ key: SETTING_OF[key], value: String(value) }];
		});
	}
};
