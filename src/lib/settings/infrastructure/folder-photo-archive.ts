import type { PhotoFolder } from '../../platform/photos/photo-folder.ts';
import type { PhotoArchive } from '../application/backup-ports.ts';
import type { BackupPhoto } from '../domain/backup.ts';

/** Backs up and restores the photo folder as a whole. */
export class FolderPhotoArchive implements PhotoArchive {
	constructor(private readonly folder: PhotoFolder) {}

	/** {@inheritDoc PhotoArchive.exportFiles} */
	exportFiles(): Promise<readonly BackupPhoto[]> {
		return this.folder.readAll();
	}

	/** {@inheritDoc PhotoArchive.replaceFiles} */
	async replaceFiles(files: readonly BackupPhoto[]): Promise<void> {
		await this.folder.clear();
		await this.folder.write(files);
	}

	/** {@inheritDoc PhotoArchive.wipe} */
	wipe(): Promise<void> {
		return this.folder.clear();
	}
}
