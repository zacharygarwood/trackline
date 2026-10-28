import type { DatabaseFile } from '../../src/lib/settings/application/backup-ports.ts';

/** A database file held as bytes in memory. */
export class InMemoryDatabaseFile implements DatabaseFile {
	constructor(public bytes: Uint8Array = new Uint8Array([1, 2, 3])) {}

	exportFile(): Promise<Uint8Array> {
		return Promise.resolve(this.bytes);
	}

	replaceFile(file: Uint8Array): Promise<void> {
		this.bytes = file;
		return Promise.resolve();
	}

	wipe(): Promise<void> {
		this.bytes = new Uint8Array();
		return Promise.resolve();
	}
}
