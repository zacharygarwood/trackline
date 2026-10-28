import { PHOTO_FOLDER } from './photo-folder.constants.ts';
import type { PhotoFile, PhotoFolder } from './photo-folder.ts';
import type { WorkerPhotoWriter } from './worker-photo-writer.ts';

const NOT_FOUND = 'NotFoundError';

const isNotFound = (error: unknown) => error instanceof DOMException && error.name === NOT_FOUND;

async function readFile(handle: FileSystemFileHandle): Promise<Uint8Array> {
	return new Uint8Array(await (await handle.getFile()).arrayBuffer());
}

/**
 * The photo folder in the Origin Private File System. Writes go through a
 * worker; reads and removals use the asynchronous OPFS API on this thread.
 */
export class OpfsPhotoFolder implements PhotoFolder {
	constructor(private readonly writer: WorkerPhotoWriter) {}

	/** {@inheritDoc PhotoFolder.write} */
	write(files: readonly PhotoFile[]): Promise<void> {
		return this.writer.write(files);
	}

	/** {@inheritDoc PhotoFolder.read} */
	async read(name: string): Promise<Uint8Array | undefined> {
		try {
			return await readFile(await (await this.folder()).getFileHandle(name));
		} catch (error) {
			if (isNotFound(error)) return undefined;
			throw error;
		}
	}

	/** {@inheritDoc PhotoFolder.remove} */
	async remove(names: readonly string[]): Promise<void> {
		const folder = await this.folder();
		for (const name of names) {
			await folder.removeEntry(name).catch((error: unknown) => {
				if (!isNotFound(error)) throw error;
			});
		}
	}

	/** {@inheritDoc PhotoFolder.readAll} */
	async readAll(): Promise<readonly PhotoFile[]> {
		const files: PhotoFile[] = [];
		for await (const handle of (await this.folder()).values()) {
			if (handle instanceof FileSystemFileHandle) {
				files.push({ name: handle.name, bytes: await readFile(handle) });
			}
		}
		return files;
	}

	/** {@inheritDoc PhotoFolder.clear} */
	async clear(): Promise<void> {
		const root = await navigator.storage.getDirectory();
		await root.removeEntry(PHOTO_FOLDER, { recursive: true }).catch((error: unknown) => {
			if (!isNotFound(error)) throw error;
		});
	}

	private async folder(): Promise<FileSystemDirectoryHandle> {
		const root = await navigator.storage.getDirectory();
		return root.getDirectoryHandle(PHOTO_FOLDER, { create: true });
	}
}
