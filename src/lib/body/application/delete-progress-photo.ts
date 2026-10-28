import type { ProgressPhotoWriter } from '../domain/progress-photo-repository.ts';
import type { ProgressPhotoId } from '../domain/progress-photo.ts';
import type { PhotoStore } from './photo-ports.ts';

/** Which photo to remove. */
export interface DeleteProgressPhotoCommand {
	readonly id: ProgressPhotoId;
}

/**
 * Removes a progress photo and both of its files. The record goes first, so
 * an interrupted delete leaves at worst an unused file, never a photo without
 * an image.
 */
export class DeleteProgressPhoto {
	constructor(
		private readonly photos: ProgressPhotoWriter,
		private readonly store: PhotoStore
	) {}

	/** @param command - The photo to remove. */
	async execute(command: DeleteProgressPhotoCommand): Promise<void> {
		await this.photos.delete(command.id);
		await this.store.delete(command.id);
	}
}
