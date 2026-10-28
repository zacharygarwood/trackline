import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { err, ok, type Result } from '../../shared/result.ts';
import type { BackupCodec } from '../application/backup-ports.ts';
import { UnreadableBackup, type Backup, type BackupManifest } from '../domain/backup.ts';
import { UnreadableReason } from '../domain/backup.constants.ts';
import { BackupEntry } from './backup-archive.constants.ts';

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
	typeof value === 'object' && value !== null;

function isManifest(value: unknown): value is BackupManifest {
	return (
		isRecord(value) &&
		typeof value.formatVersion === 'number' &&
		typeof value.appVersion === 'string' &&
		typeof value.schemaVersion === 'number' &&
		typeof value.createdAt === 'number'
	);
}

function unzip(file: Uint8Array): Readonly<Record<string, Uint8Array>> | undefined {
	try {
		return unzipSync(file);
	} catch {
		return undefined;
	}
}

function parseManifest(bytes: Uint8Array | undefined): BackupManifest | undefined {
	if (bytes === undefined) return undefined;
	try {
		const value: unknown = JSON.parse(strFromU8(bytes));
		return isManifest(value) ? value : undefined;
	} catch {
		return undefined;
	}
}

/** Packs a backup as a zip with `manifest.json` and the SQLite database file. */
export class ZipBackupCodec implements BackupCodec {
	/** {@inheritDoc BackupCodec.encode} */
	encode(backup: Backup): Uint8Array {
		return zipSync({
			[BackupEntry.manifest]: strToU8(JSON.stringify(backup.manifest)),
			[BackupEntry.database]: backup.database
		});
	}

	/** {@inheritDoc BackupCodec.decode} */
	decode(file: Uint8Array): Result<Backup, UnreadableBackup> {
		const entries = unzip(file);
		const manifest = parseManifest(entries?.[BackupEntry.manifest]);
		const database = entries?.[BackupEntry.database];
		if (manifest === undefined || database === undefined)
			return err(new UnreadableBackup(UnreadableReason.notABackup));
		return ok({ manifest, database });
	}
}
