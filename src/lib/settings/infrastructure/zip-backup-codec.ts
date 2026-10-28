import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { err, ok, type Result } from '../../shared/result.ts';
import type { BackupCodec } from '../application/backup-ports.ts';
import {
	isPhotoFileName,
	UnreadableBackup,
	type Backup,
	type BackupManifest,
	type BackupPhoto
} from '../domain/backup.ts';
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

/** The photo entries of a backup, or undefined if any has an unsafe name. */
function readPhotos(entries: Readonly<Record<string, Uint8Array>>): BackupPhoto[] | undefined {
	const photos = Object.entries(entries)
		.filter(([path]) => path.startsWith(BackupEntry.photoFolder))
		.map(([path, bytes]) => ({ name: path.slice(BackupEntry.photoFolder.length), bytes }));
	return photos.every((photo) => isPhotoFileName(photo.name)) ? photos : undefined;
}

/**
 * Packs a backup as a zip with `manifest.json`, the SQLite database file, and
 * each photo file under `photos/`.
 */
export class ZipBackupCodec implements BackupCodec {
	/** {@inheritDoc BackupCodec.encode} */
	encode(backup: Backup): Uint8Array {
		return zipSync({
			[BackupEntry.manifest]: strToU8(JSON.stringify(backup.manifest)),
			[BackupEntry.database]: backup.database,
			...Object.fromEntries(
				backup.photos.map((photo) => [`${BackupEntry.photoFolder}${photo.name}`, photo.bytes])
			)
		});
	}

	/** {@inheritDoc BackupCodec.decode} */
	decode(file: Uint8Array): Result<Backup, UnreadableBackup> {
		const entries = unzip(file);
		const manifest = parseManifest(entries?.[BackupEntry.manifest]);
		const database = entries?.[BackupEntry.database];
		const photos = entries === undefined ? undefined : readPhotos(entries);
		if (manifest === undefined || database === undefined || photos === undefined)
			return err(new UnreadableBackup(UnreadableReason.notABackup));
		return ok({ manifest, database, photos });
	}
}
