import type { Result } from '../../shared/result.ts';
import type { PhotoId } from '../domain/field.ts';
import type { PhotoSize } from './photo-size.constants.ts';

/** A photo's image files, re-encoded without any of the original's metadata. */
export interface PhotoFiles {
	readonly full: Uint8Array;
	readonly thumbnail: Uint8Array;
}

/** A re-encoded photo and the size of its full image in pixels. */
export interface EncodedPhoto extends PhotoFiles {
	readonly width: number;
	readonly height: number;
}

/** Raised when the chosen file is not an image the device can decode. */
export class UnreadableImage {}

/** Re-encodes images so no metadata, such as GPS location, is ever stored. */
export interface ImageProcessor {
	/**
	 * Decodes an image and encodes a capped-size copy and a thumbnail.
	 *
	 * @param image - The file the user chose, as is.
	 */
	reencode(image: Uint8Array): Promise<Result<EncodedPhoto, UnreadableImage>>;
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
