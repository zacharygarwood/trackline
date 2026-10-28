import { messages } from '../../i18n/messages.en.ts';
import { formatInstantDate } from '../../ui/format.ts';
import type { BackupFile } from '../application/backup-ports.ts';
import type { CountRecords } from '../application/count-records.ts';
import type { DeleteAllData } from '../application/delete-all-data.ts';
import type { ExportBackup } from '../application/export-backup.ts';
import type { BackupStatus, GetBackupStatus } from '../application/get-backup-status.ts';
import type { PreviewRestore } from '../application/preview-restore.ts';
import type { RestoreBackup } from '../application/restore-backup.ts';
import { UnreadableReason } from '../domain/backup.constants.ts';
import { UnreadableBackup, type RestoreProblem } from '../domain/backup.ts';
import type { DataCounts } from '../domain/data-inventory.ts';

/** The use cases the data panel calls. */
export interface DataPanelUseCases {
	readonly getBackupStatus: GetBackupStatus;
	readonly exportBackup: ExportBackup;
	readonly previewRestore: PreviewRestore;
	readonly restoreBackup: RestoreBackup;
	readonly countRecords: CountRecords;
	readonly deleteAllData: DeleteAllData;
}

/** A backup the user picked, waiting for them to confirm the restore. */
export interface PendingRestore {
	readonly file: Uint8Array;
	readonly summary: string;
}

/**
 * Describes stored records in words, for example "12 weigh-ins".
 *
 * @param counts - The record counts.
 */
export function describeCounts(counts: DataCounts): string {
	return messages.settings.recordCount(counts.weighIns);
}

function problemMessage(problem: RestoreProblem): string {
	return problem instanceof UnreadableBackup && problem.reason === UnreadableReason.notABackup
		? messages.settings.notABackup
		: messages.settings.newerFormat;
}

/** State and actions of Settings' backup, restore, and delete-all section. */
export class DataPanel {
	status: BackupStatus | undefined = $state();
	pendingRestore: PendingRestore | undefined = $state();
	problem: string | undefined = $state();

	constructor(
		private readonly useCases: DataPanelUseCases,
		private readonly saveFile: (file: BackupFile) => void
	) {}

	/** The last-backup line, plus a gentle reminder when one is due. */
	get statusText(): string {
		if (this.status === undefined) return '';
		const { lastExportAt, overdue } = this.status;
		const last =
			lastExportAt === undefined
				? messages.settings.neverExported
				: messages.settings.lastExport(formatInstantDate(lastExportAt));
		return overdue ? `${last} ${messages.settings.backupOverdue}` : last;
	}

	/** Loads the backup status. */
	async load(): Promise<void> {
		this.status = await this.useCases.getBackupStatus.execute();
	}

	/** Exports a backup and hands it to the browser's download flow. */
	async export(): Promise<void> {
		this.saveFile(await this.useCases.exportBackup.execute());
		await this.load();
	}

	/**
	 * Reads a chosen file and, if it is a backup, asks the user to confirm the restore.
	 *
	 * @param file - The bytes of the file the user picked.
	 */
	async choose(file: Uint8Array): Promise<void> {
		const preview = await this.useCases.previewRestore.execute({ file });
		this.problem = preview.ok ? undefined : problemMessage(preview.error);
		this.pendingRestore = preview.ok
			? {
					file,
					summary: messages.settings.restoreSummary(
						formatInstantDate(preview.value.backupCreatedAt),
						describeCounts(preview.value.replaces)
					)
				}
			: undefined;
	}

	/** Drops the picked backup without restoring it. */
	cancelRestore(): void {
		this.pendingRestore = undefined;
	}

	/**
	 * Restores the picked backup.
	 *
	 * @returns True once the data is replaced; the app must reload.
	 */
	async restore(): Promise<boolean> {
		if (this.pendingRestore === undefined) return false;
		const result = await this.useCases.restoreBackup.execute({ file: this.pendingRestore.file });
		this.pendingRestore = undefined;
		this.problem = result.ok ? undefined : problemMessage(result.error);
		return result.ok;
	}

	/** What deleting everything would remove, in words. */
	async deletionSummary(): Promise<string> {
		return messages.settings.deleteSummary(
			describeCounts(await this.useCases.countRecords.execute())
		);
	}

	/** Deletes all data; the app must reload. */
	async deleteAll(): Promise<void> {
		await this.useCases.deleteAllData.execute();
	}
}
