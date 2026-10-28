import type { ProgressPhoto, ProgressPhotoId } from './progress-photo.ts';

/** Reads stored progress photos. */
export interface ProgressPhotoReader {
	/** Every photo, newest date first. */
	findAll(): Promise<readonly ProgressPhoto[]>;
}

/** Stores and removes progress photos. */
export interface ProgressPhotoWriter {
	/** Adds a photo, or replaces the stored one with the same id. */
	save(photo: ProgressPhoto): Promise<void>;
	/** Removes a photo; does nothing if it doesn't exist. */
	delete(id: ProgressPhotoId): Promise<void>;
}
