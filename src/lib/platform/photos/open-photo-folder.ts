import { OpfsPhotoFolder } from './opfs-photo-folder.ts';
import { WorkerPhotoWriter } from './worker-photo-writer.ts';

/** Starts the photo writer worker and returns the photo folder that uses it. */
export function openPhotoFolder(): OpfsPhotoFolder {
	const worker = new Worker(new URL('./photo-writer.worker.ts', import.meta.url), {
		type: 'module',
		name: 'photos'
	});
	return new OpfsPhotoFolder(new WorkerPhotoWriter(worker));
}
