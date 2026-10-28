import type { ProgressPhotoId } from '../domain/progress-photo.ts';
import type { PhotoStore } from './photo-ports.ts';
import type { PhotoSize } from './photo-size.constants.ts';

/** Which image of which photo to read. */
export interface GetPhotoImageCommand {
	readonly id: ProgressPhotoId;
	readonly size: PhotoSize;
}

/** Reads a photo's full image or thumbnail. */
export class GetPhotoImage {
	constructor(private readonly store: PhotoStore) {}

	/**
	 * @param command - The photo and the size.
	 * @returns The image bytes, or undefined if the file is missing.
	 */
	execute(command: GetPhotoImageCommand): Promise<Uint8Array | undefined> {
		return this.store.read(command.id, command.size);
	}
}
