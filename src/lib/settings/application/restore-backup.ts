import { ok, type Result } from '../../shared/result.ts';
import { checkRestorable, type RestoreProblem } from '../domain/backup.ts';
import type { BackupCodec, DatabaseFile } from './backup-ports.ts';
import type { RestoreCommand } from './preview-restore.ts';

/** Replaces all data on this device with a backup. The app must reload afterwards. */
export class RestoreBackup {
	constructor(
		private readonly codec: BackupCodec,
		private readonly database: DatabaseFile,
		private readonly supportedSchemaVersion: number
	) {}

	/** @param command - The backup file to restore. */
	async execute(command: RestoreCommand): Promise<Result<void, RestoreProblem>> {
		const backup = this.codec.decode(command.file);
		if (!backup.ok) return backup;
		const manifest = checkRestorable(backup.value.manifest, this.supportedSchemaVersion);
		if (!manifest.ok) return manifest;
		await this.database.replaceFile(backup.value.database);
		return ok(undefined);
	}
}
