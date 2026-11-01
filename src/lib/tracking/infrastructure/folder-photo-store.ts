import type { PhotoFolder } from '../../platform/photos/photo-folder.ts';
import type { PhotoFiles, PhotoStore } from '../application/photo-ports.ts';
import { PhotoSize } from '../application/photo-size.constants.ts';
import type { PhotoId } from '../domain/field.ts';
import { THUMBNAIL_SUFFIX } from './photo-file.constants.ts';

const fileName = (id: PhotoId, size: PhotoSize) =>
	size === PhotoSize.full ? id : `${id}${THUMBNAIL_SUFFIX}`;

/** Keeps each photo as two files in the photo folder: `<id>` and `<id>.thumb`. */
export class FolderPhotoStore implements PhotoStore {
	constructor(private readonly folder: PhotoFolder) {}

	/** {@inheritDoc PhotoStore.put} */
	put(id: PhotoId, files: PhotoFiles): Promise<void> {
		return this.folder.write([
			{ name: fileName(id, PhotoSize.full), bytes: files.full },
			{ name: fileName(id, PhotoSize.thumbnail), bytes: files.thumbnail }
		]);
	}

	/** {@inheritDoc PhotoStore.read} */
	read(id: PhotoId, size: PhotoSize): Promise<Uint8Array | undefined> {
		return this.folder.read(fileName(id, size));
	}

	/** {@inheritDoc PhotoStore.delete} */
	delete(id: PhotoId): Promise<void> {
		return this.folder.remove([fileName(id, PhotoSize.full), fileName(id, PhotoSize.thumbnail)]);
	}
}
