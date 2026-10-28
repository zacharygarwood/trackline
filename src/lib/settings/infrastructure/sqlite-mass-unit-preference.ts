import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { MassUnitReader, MassUnitWriter } from '../domain/mass-unit-preference.ts';
import { readSetting, SettingKey, writeSetting } from './app-setting.sql.ts';

const isMassUnit = (value: unknown): value is MassUnit =>
	Object.values<unknown>(MassUnit).includes(value);

/** The unit preference stored in the `app_setting` table. */
export class SqliteMassUnitPreference implements MassUnitReader, MassUnitWriter {
	constructor(private readonly database: SqlDriver) {}

	/**
	 * {@inheritDoc MassUnitReader.read}
	 *
	 * @throws If the stored value is not a known unit.
	 */
	async read(): Promise<MassUnit | undefined> {
		const value = first(await this.database.query(readSetting(SettingKey.massUnit)))?.value;
		if (value === undefined || isMassUnit(value)) return value;
		throw new Error('Corrupt app_setting row: unknown mass unit');
	}

	/** {@inheritDoc MassUnitWriter.write} */
	async write(unit: MassUnit): Promise<void> {
		await this.database.execute(writeSetting(SettingKey.massUnit, unit));
	}
}
