import { err, ok, type Result } from '../../shared/result.ts';
import { UnreadableReason } from './backup.constants.ts';

/** The backup file layout this version writes and can read. */
export const BACKUP_FORMAT_VERSION = 1;

/** How long after the last export the app starts suggesting a new one. */
export const BACKUP_REMINDER_DAYS = 30;

const MILLISECONDS_PER_DAY = 86_400_000;

/** Describes a backup: which app and schema made it, and when. */
export interface BackupManifest {
	readonly formatVersion: number;
	readonly appVersion: string;
	readonly schemaVersion: number;
	/** When the backup was made, in epoch milliseconds. */
	readonly createdAt: number;
}

/** One photo file, named as the photo store names it. */
export interface BackupPhoto {
	readonly name: string;
	readonly bytes: Uint8Array;
}

/** Everything needed to restore the app on another device. */
export interface Backup {
	readonly manifest: BackupManifest;
	readonly database: Uint8Array;
	readonly photos: readonly BackupPhoto[];
}

const PHOTO_FILE_NAME = /^[\w-]+(\.[\w-]+)?$/;

/**
 * Whether a name from a backup is safe to use as a photo file name: letters,
 * digits, dashes, and underscores with at most one extension, so it can never
 * point outside the photo folder.
 *
 * @param name - A file name read from a backup.
 */
export function isPhotoFileName(name: string): boolean {
	return PHOTO_FILE_NAME.test(name);
}

/** Raised when a file is not a backup this app can read. */
export class UnreadableBackup {
	/** @param reason - Whether the file isn't a backup at all, or uses a newer layout. */
	constructor(readonly reason: UnreadableReason) {}
}

/** Raised when a backup comes from a newer version of the app, whose data this version can't understand. */
export class BackupFromNewerVersion {
	/**
	 * @param schemaVersion - The backup's schema version.
	 * @param supportedVersion - The newest schema this version understands.
	 */
	constructor(
		readonly schemaVersion: number,
		readonly supportedVersion: number
	) {}
}

/** Why a backup can't be restored. */
export type RestoreProblem = UnreadableBackup | BackupFromNewerVersion;

/**
 * Checks that this version of the app can restore a backup.
 *
 * @param manifest - The backup's manifest.
 * @param supportedSchemaVersion - The newest schema this version understands.
 */
export function checkRestorable(
	manifest: BackupManifest,
	supportedSchemaVersion: number
): Result<BackupManifest, RestoreProblem> {
	if (manifest.formatVersion > BACKUP_FORMAT_VERSION)
		return err(new UnreadableBackup(UnreadableReason.newerFormat));
	if (manifest.schemaVersion > supportedSchemaVersion) {
		return err(new BackupFromNewerVersion(manifest.schemaVersion, supportedSchemaVersion));
	}
	return ok(manifest);
}

/**
 * Whether it is time to suggest exporting a backup.
 *
 * @param lastExportAt - When the user last exported, in epoch milliseconds, if ever.
 * @param now - The current instant in epoch milliseconds.
 */
export function isBackupOverdue(lastExportAt: number | undefined, now: number): boolean {
	return (
		lastExportAt === undefined || now - lastExportAt > BACKUP_REMINDER_DAYS * MILLISECONDS_PER_DAY
	);
}
