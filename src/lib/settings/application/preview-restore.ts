import { err, ok, type Result } from '../../shared/result.ts';
import { checkRestorable, type RestoreProblem } from '../domain/backup.ts';
import type { DataCounts, DataInventory } from '../domain/data-inventory.ts';
import type { BackupCodec } from './backup-ports.ts';

/** What restoring a backup would do: when the backup was made and what it would replace. */
export interface RestorePreview {
	readonly backupCreatedAt: number;
	readonly replaces: DataCounts;
}

/** The file the user chose. */
export interface RestoreCommand {
	readonly file: Uint8Array;
}

/** Reads a backup file and describes what restoring it would overwrite, without changing anything. */
export class PreviewRestore {
	constructor(
		private readonly codec: BackupCodec,
		private readonly inventory: DataInventory,
		private readonly supportedSchemaVersion: number
	) {}

	/** @param command - The chosen file. */
	async execute(command: RestoreCommand): Promise<Result<RestorePreview, RestoreProblem>> {
		const backup = this.codec.decode(command.file);
		if (!backup.ok) return backup;
		const manifest = checkRestorable(backup.value.manifest, this.supportedSchemaVersion);
		if (!manifest.ok) return err(manifest.error);
		return ok({
			backupCreatedAt: manifest.value.createdAt,
			replaces: await this.inventory.count()
		});
	}
}
