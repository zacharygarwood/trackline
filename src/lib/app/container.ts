import { ClearWeightGoal } from '../body/application/clear-weight-goal.ts';
import { DeleteWeighIn } from '../body/application/delete-weigh-in.ts';
import { GetWeightGoal } from '../body/application/get-weight-goal.ts';
import { ListWeighIns } from '../body/application/list-weigh-ins.ts';
import { RecordWeighIn } from '../body/application/record-weigh-in.ts';
import { SetWeightGoal } from '../body/application/set-weight-goal.ts';
import { SqliteWeighInRepository } from '../body/infrastructure/sqlite-weigh-in-repository.ts';
import { SqliteWeightGoalRepository } from '../body/infrastructure/sqlite-weight-goal-repository.ts';
import { downloadFile, type DownloadableFile } from '../platform/backup/download-file.ts';
import { bundledMigrations } from '../platform/db/bundled-migrations.ts';
import { migrate } from '../platform/db/migrate.ts';
import { openDatabase } from '../platform/db/open-database.ts';
import type { SqlDriver } from '../platform/db/sql-driver.ts';
import { requestPersistentStorage } from '../platform/pwa/persistent-storage.ts';
import { SystemClock } from '../platform/system/system-clock.ts';
import { UuidV7IdGenerator } from '../platform/system/uuid-v7-id-generator.ts';
import type { DatabaseFile } from '../settings/application/backup-ports.ts';
import { CompleteSetup } from '../settings/application/complete-setup.ts';
import { CountRecords } from '../settings/application/count-records.ts';
import { DeleteAllData } from '../settings/application/delete-all-data.ts';
import { ExportBackup } from '../settings/application/export-backup.ts';
import { GetBackupStatus } from '../settings/application/get-backup-status.ts';
import { GetMassUnit } from '../settings/application/get-mass-unit.ts';
import { GetSetupStatus } from '../settings/application/get-setup-status.ts';
import { PreviewRestore } from '../settings/application/preview-restore.ts';
import { RestoreBackup } from '../settings/application/restore-backup.ts';
import { SetMassUnit } from '../settings/application/set-mass-unit.ts';
import { SqliteAppState } from '../settings/infrastructure/sqlite-app-state.ts';
import { SqliteDataInventory } from '../settings/infrastructure/sqlite-data-inventory.ts';
import { SqliteMassUnitPreference } from '../settings/infrastructure/sqlite-mass-unit-preference.ts';
import { ZipBackupCodec } from '../settings/infrastructure/zip-backup-codec.ts';
import { last } from '../shared/collections.ts';
import type { Clock } from '../shared/clock.ts';

/** Every use case the UI can call, grouped by bounded context. */
export interface App {
	readonly clock: Clock;
	readonly body: ReturnType<typeof wireBody>;
	readonly settings: ReturnType<typeof wireSettings>;
	/** Hands a file to the browser's download flow. */
	readonly saveFile: (file: DownloadableFile) => void;
}

/** The infrastructure the use cases run on. */
export interface Infrastructure {
	readonly database: SqlDriver;
	readonly databaseFile: DatabaseFile;
	readonly clock: Clock;
}

/** The newest schema version this build understands. */
const SCHEMA_VERSION = last(bundledMigrations)?.version ?? 0;

function wireBody({ database, clock }: Infrastructure) {
	const weighIns = new SqliteWeighInRepository(database);
	const weightGoal = new SqliteWeightGoalRepository(database);
	return {
		recordWeighIn: new RecordWeighIn(weighIns, new UuidV7IdGenerator(clock)),
		deleteWeighIn: new DeleteWeighIn(weighIns),
		listWeighIns: new ListWeighIns(weighIns),
		getWeightGoal: new GetWeightGoal(weightGoal),
		setWeightGoal: new SetWeightGoal(weightGoal),
		clearWeightGoal: new ClearWeightGoal(weightGoal)
	};
}

function wireSettings({ database, databaseFile, clock }: Infrastructure) {
	const massUnit = new SqliteMassUnitPreference(database);
	const state = new SqliteAppState(database);
	const inventory = new SqliteDataInventory(database);
	const codec = new ZipBackupCodec();
	const version = { appVersion: __APP_VERSION__, schemaVersion: SCHEMA_VERSION };
	return {
		getMassUnit: new GetMassUnit(massUnit),
		setMassUnit: new SetMassUnit(massUnit),
		getSetupStatus: new GetSetupStatus(state),
		completeSetup: new CompleteSetup(state),
		getBackupStatus: new GetBackupStatus(state, clock),
		countRecords: new CountRecords(inventory),
		exportBackup: new ExportBackup({
			database: databaseFile,
			codec,
			lastExport: state,
			clock,
			version
		}),
		previewRestore: new PreviewRestore(codec, inventory, SCHEMA_VERSION),
		restoreBackup: new RestoreBackup(codec, databaseFile, SCHEMA_VERSION),
		deleteAllData: new DeleteAllData(databaseFile)
	};
}

/**
 * Wires infrastructure to use cases. This is the composition root, the only
 * module that knows which implementation backs each port.
 *
 * @param infrastructure - The database, its file, and the clock.
 */
export function wireApp(infrastructure: Infrastructure): App {
	return {
		clock: infrastructure.clock,
		body: wireBody(infrastructure),
		settings: wireSettings(infrastructure),
		saveFile: downloadFile
	};
}

/**
 * Opens the on-device database, brings its schema up to date, asks the
 * browser to keep the data, and returns the wired app.
 *
 * @throws If the database can't be opened or migrated.
 */
export async function startApp(): Promise<App> {
	const database = openDatabase();
	await migrate(database, bundledMigrations);
	void requestPersistentStorage(navigator.storage);
	return wireApp({ database, databaseFile: database, clock: new SystemClock() });
}
