import type { PhotoArchive } from '../../src/lib/settings/application/backup-ports.ts';
import type { BackupPhoto } from '../../src/lib/settings/domain/backup.ts';

/** Photo files held in memory, as the backup use cases see them. */
export class InMemoryPhotoArchive implements PhotoArchive {
	constructor(public files: readonly BackupPhoto[] = []) {}

	exportFiles(): Promise<readonly BackupPhoto[]> {
		return Promise.resolve(this.files);
	}

	replaceFiles(files: readonly BackupPhoto[]): Promise<void> {
		this.files = files;
		return Promise.resolve();
	}

	wipe(): Promise<void> {
		this.files = [];
		return Promise.resolve();
	}
}
