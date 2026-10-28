import type { PhotoFiles, PhotoStore } from '../../src/lib/body/application/photo-ports.ts';
import { PhotoSize } from '../../src/lib/body/application/photo-size.constants.ts';
import type { ProgressPhotoId } from '../../src/lib/body/domain/progress-photo.ts';

/** Photo files kept in a map, for use case tests. The OPFS store is covered end to end. */
export class InMemoryPhotoStore implements PhotoStore {
	readonly files = new Map<ProgressPhotoId, PhotoFiles>();

	put(id: ProgressPhotoId, files: PhotoFiles): Promise<void> {
		this.files.set(id, files);
		return Promise.resolve();
	}

	read(id: ProgressPhotoId, size: PhotoSize): Promise<Uint8Array | undefined> {
		const files = this.files.get(id);
		return Promise.resolve(size === PhotoSize.full ? files?.full : files?.thumbnail);
	}

	delete(id: ProgressPhotoId): Promise<void> {
		this.files.delete(id);
		return Promise.resolve();
	}
}
