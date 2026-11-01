import type { Result } from '../../shared/result.ts';
import type { PhotoId } from '../domain/field.ts';
import type { PhotoSize } from './photo-size.constants.ts';

/** A photo's image files: the file the user chose, and a small copy for grids. */
export interface PhotoFiles {
	readonly full: Uint8Array;
	readonly thumbnail: Uint8Array;
}

/** Raised when the chosen file is not an image the device can decode. */
export class UnreadableImage {}

/** Makes the small copies of photos that grids show. */
export interface ImageProcessor {
	/**
	 * Decodes an image and encodes a small copy of it.
	 *
	 * @param image - The file the user chose, as is.
	 */
	thumbnail(image: Uint8Array): Promise<Result<Uint8Array, UnreadableImage>>;
}

/** Keeps photos' image files next to the database. */
export interface PhotoStore {
	/** Stores a photo's files, replacing any under the same id. */
	put(id: PhotoId, files: PhotoFiles): Promise<void>;
	/** One of a photo's images, or undefined if it isn't stored. */
	read(id: PhotoId, size: PhotoSize): Promise<Uint8Array | undefined>;
	/** Removes a photo's files; does nothing if they don't exist. */
	delete(id: PhotoId): Promise<void>;
}
