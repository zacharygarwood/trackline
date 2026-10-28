import type { Result } from '../../shared/result.ts';
import type { Backup, UnreadableBackup } from '../domain/backup.ts';

/** The on-device database file, which backups copy and restore. */
export interface DatabaseFile {
	/** The database's bytes. */
	exportFile(): Promise<Uint8Array>;
	/** Replaces the database with a backup's bytes. The app must reload afterwards. */
	replaceFile(file: Uint8Array): Promise<void>;
	/** Deletes the database. The app must reload afterwards. */
	wipe(): Promise<void>;
}

/** Turns a backup into a single file and back. */
export interface BackupCodec {
	/** Packs a backup into one file. */
	encode(backup: Backup): Uint8Array;
	/** Unpacks a file, or explains that it isn't a readable backup. */
	decode(file: Uint8Array): Result<Backup, UnreadableBackup>;
}

/** A file ready to hand to the operating system's save or share sheet. */
export interface BackupFile {
	readonly name: string;
	readonly bytes: Uint8Array;
}

/** The app version and the newest schema it understands. */
export interface AppVersion {
	readonly appVersion: string;
	readonly schemaVersion: number;
}
