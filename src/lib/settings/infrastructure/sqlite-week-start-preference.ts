import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import type { WeekStartReader, WeekStartWriter } from '../domain/week-start-preference.ts';
import { readSetting, SettingKey, writeSetting } from './app-setting.sql.ts';

const isWeekStart = (value: unknown): value is WeekStart =>
	Object.values<unknown>(WeekStart).includes(value);

/** The week start preference stored in the `app_setting` table. */
export class SqliteWeekStartPreference implements WeekStartReader, WeekStartWriter {
	constructor(private readonly database: SqlDriver) {}

	/**
	 * {@inheritDoc WeekStartReader.read}
	 *
	 * @throws If the stored value is not a known day.
	 */
	async read(): Promise<WeekStart | undefined> {
		const value = first(await this.database.query(readSetting(SettingKey.weekStart)))?.value;
		if (value === undefined || isWeekStart(value)) return value;
		throw new Error('Corrupt app_setting row: unknown week start');
	}

	/** {@inheritDoc WeekStartWriter.write} */
	async write(weekStart: WeekStart): Promise<void> {
		await this.database.execute(writeSetting(SettingKey.weekStart, weekStart));
	}
}
