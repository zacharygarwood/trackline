import type { IdGenerator } from '../../shared/id-generator.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, type Result } from '../../shared/result.ts';
import type { Pose } from '../domain/pose.constants.ts';
import type { ProgressPhotoWriter } from '../domain/progress-photo-repository.ts';
import {
	createProgressPhoto,
	type InvalidPhotoSize,
	type ProgressPhoto
} from '../domain/progress-photo.ts';
import type { ImageProcessor, PhotoStore, UnreadableImage } from './photo-ports.ts';

/** The chosen image file, and the day and pose it shows. */
export interface AddProgressPhotoCommand {
	readonly date: LocalDate;
	readonly pose: Pose;
	readonly image: Uint8Array;
}

/** What adding a photo needs. */
export interface AddProgressPhotoPorts {
	readonly processor: ImageProcessor;
	readonly store: PhotoStore;
	readonly photos: ProgressPhotoWriter;
	readonly ids: IdGenerator;
}

/** Why a photo could not be added. */
export type AddPhotoProblem = UnreadableImage | InvalidPhotoSize;

/**
 * Adds a progress photo. The image is re-encoded first, so its metadata
 * (including GPS location) never reaches storage, and the photo is recorded
 * only after its files are stored.
 */
export class AddProgressPhoto {
	constructor(private readonly ports: AddProgressPhotoPorts) {}

	/** @param command - The image, day, and pose. */
	async execute(command: AddProgressPhotoCommand): Promise<Result<ProgressPhoto, AddPhotoProblem>> {
		const { processor, store, photos, ids } = this.ports;
		const encoded = await processor.reencode(command.image);
		if (!encoded.ok) return err(encoded.error);
		const { full, thumbnail, width, height } = encoded.value;
		const photo = createProgressPhoto({
			id: ids.next(),
			date: command.date,
			pose: command.pose,
			width,
			height
		});
		if (!photo.ok) return photo;
		await store.put(photo.value.id, { full, thumbnail });
		await photos.save(photo.value);
		return photo;
	}
}
