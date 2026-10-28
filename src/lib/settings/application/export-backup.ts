import type { Clock } from '../../shared/clock.ts';
import { BACKUP_FORMAT_VERSION } from '../domain/backup.ts';
import type { LastExportStore } from '../domain/app-state-repository.ts';
import { BACKUP_FILE_EXTENSION, BACKUP_FILE_PREFIX } from './backup-file.constants.ts';
import type { AppVersion, BackupCodec, BackupFile, DatabaseFile } from './backup-ports.ts';

/** What exporting a backup needs. */
export interface ExportBackupPorts {
	readonly database: DatabaseFile;
	readonly codec: BackupCodec;
	readonly lastExport: LastExportStore;
	readonly clock: Clock;
	readonly version: AppVersion;
}

/** Packs all data into one file the user can keep, and remembers when they did. */
export class ExportBackup {
	constructor(private readonly ports: ExportBackupPorts) {}

	/** @returns The backup file, named with today's date. */
	async execute(): Promise<BackupFile> {
		const { database, codec, lastExport, clock, version } = this.ports;
		const createdAt = clock.now();
		const bytes = codec.encode({
			manifest: { formatVersion: BACKUP_FORMAT_VERSION, ...version, createdAt },
			database: await database.exportFile()
		});
		await lastExport.write(createdAt);
		return {
			name: `${BACKUP_FILE_PREFIX}${clock.today().toString()}${BACKUP_FILE_EXTENSION}`,
			bytes
		};
	}
}
