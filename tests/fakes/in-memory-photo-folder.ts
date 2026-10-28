import type { PhotoFile, PhotoFolder } from '../../src/lib/platform/photos/photo-folder.ts';

/** A photo folder held in a map, standing in for OPFS in Node tests. */
export class InMemoryPhotoFolder implements PhotoFolder {
	readonly files = new Map<string, Uint8Array>();

	write(files: readonly PhotoFile[]): Promise<void> {
		for (const file of files) this.files.set(file.name, file.bytes);
		return Promise.resolve();
	}

	read(name: string): Promise<Uint8Array | undefined> {
		return Promise.resolve(this.files.get(name));
	}

	remove(names: readonly string[]): Promise<void> {
		for (const name of names) this.files.delete(name);
		return Promise.resolve();
	}

	readAll(): Promise<readonly PhotoFile[]> {
		return Promise.resolve([...this.files].map(([name, bytes]) => ({ name, bytes })));
	}

	clear(): Promise<void> {
		this.files.clear();
		return Promise.resolve();
	}
}
