import { ok, type Result } from '../../shared/result.ts';
import { checkRestorable, type RestoreProblem } from '../domain/backup.ts';
import type { BackupCodec, DatabaseFile, PhotoArchive } from './backup-ports.ts';
import type { RestoreCommand } from './preview-restore.ts';

/** What restoring a backup needs. */
export interface RestoreBackupPorts {
	readonly codec: BackupCodec;
	readonly database: DatabaseFile;
	readonly photos: PhotoArchive;
	/** The newest schema this version understands. */
	readonly supportedSchemaVersion: number;
}

/** Replaces all data on this device, photos included, with a backup. The app must reload afterwards. */
export class RestoreBackup {
	constructor(private readonly ports: RestoreBackupPorts) {}

	/** @param command - The backup file to restore. */
	async execute(command: RestoreCommand): Promise<Result<void, RestoreProblem>> {
		const { codec, database, photos, supportedSchemaVersion } = this.ports;
		const backup = codec.decode(command.file);
		if (!backup.ok) return backup;
		const manifest = checkRestorable(backup.value.manifest, supportedSchemaVersion);
		if (!manifest.ok) return manifest;
		await photos.replaceFiles(backup.value.photos);
		await database.replaceFile(backup.value.database);
		return ok(undefined);
	}
}
