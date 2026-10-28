import type { DatabaseFile } from './backup-ports.ts';

/** Erases every record on this device. The app must reload afterwards. */
export class DeleteAllData {
	constructor(private readonly database: DatabaseFile) {}

	/** Deletes the database. */
	async execute(): Promise<void> {
		await this.database.wipe();
	}
}
