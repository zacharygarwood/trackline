import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { LastExportStore, SetupStatusStore } from '../domain/app-state-repository.ts';
import { readSetting, SettingKey, writeSetting } from './app-setting.sql.ts';

const COMPLETE = '1';

/** Backup and first-run state stored in the `app_setting` table. */
export class SqliteAppState implements LastExportStore, SetupStatusStore {
	constructor(private readonly database: SqlDriver) {}

	/**
	 * {@inheritDoc LastExportStore.read}
	 *
	 * @throws If the stored value is not a timestamp.
	 */
	async read(): Promise<number | undefined> {
		const value = await this.setting(SettingKey.lastExportAt);
		if (value === undefined) return undefined;
		const exportedAt = Number(value);
		if (!Number.isSafeInteger(exportedAt))
			throw new Error('Corrupt app_setting row: last export time');
		return exportedAt;
	}

	/** {@inheritDoc LastExportStore.write} */
	async write(exportedAt: number): Promise<void> {
		await this.database.execute(writeSetting(SettingKey.lastExportAt, String(exportedAt)));
	}

	/** {@inheritDoc SetupStatusStore.isComplete} */
	async isComplete(): Promise<boolean> {
		return (await this.setting(SettingKey.setupComplete)) === COMPLETE;
	}

	/** {@inheritDoc SetupStatusStore.markComplete} */
	async markComplete(): Promise<void> {
		await this.database.execute(writeSetting(SettingKey.setupComplete, COMPLETE));
	}

	private async setting(key: SettingKey): Promise<string | undefined> {
		const value = first(await this.database.query(readSetting(key)))?.value;
		return typeof value === 'string' ? value : undefined;
	}
}
