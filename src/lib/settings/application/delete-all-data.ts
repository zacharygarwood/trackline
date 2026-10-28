import type { DatabaseFile, PhotoArchive } from './backup-ports.ts';

/** Erases every record and photo on this device. The app must reload afterwards. */
export class DeleteAllData {
	constructor(
		private readonly database: DatabaseFile,
		private readonly photos: PhotoArchive
	) {}

	/** Deletes the photos, then the database. */
	async execute(): Promise<void> {
		await this.photos.wipe();
		await this.database.wipe();
	}
}
