import type { Clock } from '../../shared/clock.ts';
import { isBackupOverdue } from '../domain/backup.ts';
import type { LastExportStore } from '../domain/app-state-repository.ts';

/** When the user last exported, and whether to suggest a new export. */
export interface BackupStatus {
	readonly lastExportAt: number | undefined;
	readonly overdue: boolean;
}

/** Reads the backup reminder state for Settings. */
export class GetBackupStatus {
	constructor(
		private readonly lastExport: LastExportStore,
		private readonly clock: Clock
	) {}

	/** @returns The last export time and whether a reminder is due. */
	async execute(): Promise<BackupStatus> {
		const lastExportAt = await this.lastExport.read();
		return { lastExportAt, overdue: isBackupOverdue(lastExportAt, this.clock.now()) };
	}
}
