import { PHOTO_FOLDER } from './photo-folder.constants.ts';
import type { PhotoFile } from './photo-folder.ts';
import { isPhotoWriteRequest, type PhotoWriteResponse } from './photo-writer-protocol.ts';

/** The synchronous OPFS file access available only in workers, which the DOM types leave out. */
interface SyncAccessHandle {
	truncate(size: number): void;
	write(buffer: Uint8Array, options: { readonly at: number }): number;
	flush(): void;
	close(): void;
}

interface SyncAccessFileHandle {
	createSyncAccessHandle(): Promise<SyncAccessHandle>;
}

const hasSyncAccess = (
	handle: FileSystemFileHandle
): handle is FileSystemFileHandle & SyncAccessFileHandle => 'createSyncAccessHandle' in handle;

async function writeFile(folder: FileSystemDirectoryHandle, file: PhotoFile): Promise<void> {
	const handle = await folder.getFileHandle(file.name, { create: true });
	if (!hasSyncAccess(handle)) throw new Error('This browser cannot write photo files');
	const access = await handle.createSyncAccessHandle();
	try {
		access.truncate(0);
		access.write(file.bytes, { at: 0 });
		access.flush();
	} finally {
		access.close();
	}
}

async function writeFiles(files: readonly PhotoFile[]): Promise<void> {
	const root = await navigator.storage.getDirectory();
	const folder = await root.getDirectoryHandle(PHOTO_FOLDER, { create: true });
	for (const file of files) await writeFile(folder, file);
}

let queue: Promise<unknown> = Promise.resolve();

self.addEventListener('message', (event: MessageEvent<unknown>) => {
	const request = event.data;
	if (!isPhotoWriteRequest(request)) return;
	queue = queue.then(async () => {
		const response: PhotoWriteResponse = await writeFiles(request.files).then(
			() => ({ id: request.id, ok: true }),
			(error: unknown) => ({ id: request.id, ok: false, message: String(error) })
		);
		self.postMessage(response);
	});
});
