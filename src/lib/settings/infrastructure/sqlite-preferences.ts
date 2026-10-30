import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import type { Preferences, PreferencesReader, PreferencesWriter } from '../domain/preferences.ts';
import { readSettings, writeSetting } from './app-setting.sql.ts';
import { PREFERENCE_SETTINGS, PreferencesMapper } from './preferences.mapper.ts';

/** Preferences stored in the `app_setting` table, one row each. */
export class SqlitePreferences implements PreferencesReader, PreferencesWriter {
	constructor(private readonly database: SqlDriver) {}

	/**
	 * {@inheritDoc PreferencesReader.read}
	 *
	 * @throws If a stored value is not one the app writes.
	 */
	async read(): Promise<Partial<Preferences>> {
		const rows = await this.database.query(readSettings(PREFERENCE_SETTINGS));
		return requireValidRow(PreferencesMapper.toDomain(rows));
	}

	/** {@inheritDoc PreferencesWriter.write} */
	async write(changes: Partial<Preferences>): Promise<void> {
		await this.database.transaction(
			PreferencesMapper.toRows(changes).map((row) => writeSetting(row.key, row.value))
		);
	}
}
