import { bundledMigrations } from '../platform/db/bundled-migrations.ts';
import { CompleteSetup } from '../settings/application/complete-setup.ts';
import { CountRecords } from '../settings/application/count-records.ts';
import { DeleteAllData } from '../settings/application/delete-all-data.ts';
import { DismissInstallHint } from '../settings/application/dismiss-install-hint.ts';
import { ExportBackup } from '../settings/application/export-backup.ts';
import { GetBackupStatus } from '../settings/application/get-backup-status.ts';
import { GetMassUnit } from '../settings/application/get-mass-unit.ts';
import { GetPreferences } from '../settings/application/get-preferences.ts';
import { GetSetupStatus } from '../settings/application/get-setup-status.ts';
import { PreviewRestore } from '../settings/application/preview-restore.ts';
import { RestoreBackup } from '../settings/application/restore-backup.ts';
import { SetMassUnit } from '../settings/application/set-mass-unit.ts';
import { ShouldShowInstallHint } from '../settings/application/should-show-install-hint.ts';
import { UpdatePreferences } from '../settings/application/update-preferences.ts';
import { GetWeekStart } from '../settings/application/get-week-start.ts';
import { SetWeekStart } from '../settings/application/set-week-start.ts';
import { FolderPhotoArchive } from '../settings/infrastructure/folder-photo-archive.ts';
import { SqliteAppState } from '../settings/infrastructure/sqlite-app-state.ts';
import { SqliteDataInventory } from '../settings/infrastructure/sqlite-data-inventory.ts';
import { SqliteMassUnitPreference } from '../settings/infrastructure/sqlite-mass-unit-preference.ts';
import { SqlitePreferences } from '../settings/infrastructure/sqlite-preferences.ts';
import { SqliteWeekStartPreference } from '../settings/infrastructure/sqlite-week-start-preference.ts';
import { ZipBackupCodec } from '../settings/infrastructure/zip-backup-codec.ts';
import { last } from '../shared/collections.ts';
import type { Infrastructure } from './infrastructure.ts';

/** The newest schema version this build understands. */
const SCHEMA_VERSION = last(bundledMigrations)?.version ?? 0;

function wireBackup({ database, databaseFile, photoFolder, clock }: Infrastructure) {
	const state = new SqliteAppState(database);
	const inventory = new SqliteDataInventory(database);
	const codec = new ZipBackupCodec();
	const photos = new FolderPhotoArchive(photoFolder);
	return {
		getBackupStatus: new GetBackupStatus(state, clock),
		countRecords: new CountRecords(inventory),
		exportBackup: new ExportBackup({
			database: databaseFile,
			photos,
			codec,
			lastExport: state,
			clock,
			version: { appVersion: __APP_VERSION__, schemaVersion: SCHEMA_VERSION }
		}),
		previewRestore: new PreviewRestore(codec, inventory, SCHEMA_VERSION),
		restoreBackup: new RestoreBackup({
			codec,
			database: databaseFile,
			photos,
			supportedSchemaVersion: SCHEMA_VERSION
		}),
		deleteAllData: new DeleteAllData(databaseFile, photos)
	};
}

/**
 * Wires the Settings context: preferences, first run, the install hint, and backups.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireSettings(infrastructure: Infrastructure) {
	const massUnit = new SqliteMassUnitPreference(infrastructure.database);
	const state = new SqliteAppState(infrastructure.database);
	const weekStart = new SqliteWeekStartPreference(infrastructure.database);
	const preferences = new SqlitePreferences(infrastructure.database);
	return {
		getPreferences: new GetPreferences(preferences),
		updatePreferences: new UpdatePreferences(preferences),
		getMassUnit: new GetMassUnit(massUnit),
		setMassUnit: new SetMassUnit(massUnit),
		getWeekStart: new GetWeekStart(weekStart),
		setWeekStart: new SetWeekStart(weekStart),
		getSetupStatus: new GetSetupStatus(state),
		completeSetup: new CompleteSetup(state),
		shouldShowInstallHint: new ShouldShowInstallHint(state),
		dismissInstallHint: new DismissInstallHint(state),
		...wireBackup(infrastructure)
	};
}
