import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { PhotoId } from '../domain/field.ts';
import type { ImageProcessor, PhotoStore, UnreadableImage } from './photo-ports.ts';
import type { PhotoSize } from './photo-size.constants.ts';

/** The image file the user chose. */
export interface SavePhotoCommand {
	readonly image: Uint8Array;
}

/** What saving a photo needs. */
export interface SavePhotoPorts {
	readonly processor: ImageProcessor;
	readonly store: PhotoStore;
	readonly ids: IdGenerator;
}

/**
 * Stores a photo for a photo field: the chosen file as is, so it keeps its
 * full quality, and a thumbnail for grids.
 */
export class SavePhoto {
	constructor(private readonly ports: SavePhotoPorts) {}

	/** @param command - The chosen image. */
	async execute(command: SavePhotoCommand): Promise<Result<PhotoId, UnreadableImage>> {
		const thumbnail = await this.ports.processor.thumbnail(command.image);
		if (!thumbnail.ok) return err(thumbnail.error);
		const id = this.ports.ids.next<'Photo'>();
		await this.ports.store.put(id, { full: command.image, thumbnail: thumbnail.value });
		return ok(id);
	}
}

/** Which image of which photo to read. */
export interface GetPhotoImageCommand {
	readonly id: PhotoId;
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

/** Which photo to remove. */
export interface DiscardPhotoCommand {
	readonly id: PhotoId;
}

/** Removes a photo the user took for an entry they did not log. */
export class DiscardPhoto {
	constructor(private readonly store: PhotoStore) {}

	/** @param command - The photo. */
	async execute(command: DiscardPhotoCommand): Promise<void> {
		await this.store.delete(command.id);
	}
}
