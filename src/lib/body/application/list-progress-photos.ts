import type { ProgressPhotoReader } from '../domain/progress-photo-repository.ts';
import type { ProgressPhoto } from '../domain/progress-photo.ts';

/** Lists every progress photo, newest date first. */
export class ListProgressPhotos {
	constructor(private readonly photos: ProgressPhotoReader) {}

	/** Reads the list. */
	execute(): Promise<readonly ProgressPhoto[]> {
		return this.photos.findAll();
	}
}
