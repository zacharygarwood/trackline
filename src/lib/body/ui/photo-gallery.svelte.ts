import { messages } from '../../i18n/messages.en.ts';
import type { Clock } from '../../shared/clock.ts';
import { last } from '../../shared/collections.ts';
import { LocalDate } from '../../shared/local-date.ts';
import type { AddProgressPhoto } from '../application/add-progress-photo.ts';
import type { DeleteProgressPhoto } from '../application/delete-progress-photo.ts';
import type { GetPhotoImage } from '../application/get-photo-image.ts';
import type { ListProgressPhotos } from '../application/list-progress-photos.ts';
import type { PhotoSize } from '../application/photo-size.constants.ts';
import type { Pose } from '../domain/pose.constants.ts';
import type { ProgressPhoto } from '../domain/progress-photo.ts';
import { ImageUrlCache, type ImageUrls } from './image-url-cache.ts';

/** The use cases the photo screens call. */
export interface PhotoGalleryUseCases {
	readonly listProgressPhotos: ListProgressPhotos;
	readonly addProgressPhoto: AddProgressPhoto;
	readonly deleteProgressPhoto: DeleteProgressPhoto;
	readonly getPhotoImage: GetPhotoImage;
}

/** The photos taken on one day. */
export interface PhotoDay {
	readonly date: LocalDate;
	readonly photos: readonly ProgressPhoto[];
}

/**
 * Groups photos listed newest first under their dates.
 *
 * @param photos - Photos, newest first.
 */
export function photosByDay(photos: readonly ProgressPhoto[]): readonly PhotoDay[] {
	const days: { readonly date: LocalDate; readonly photos: ProgressPhoto[] }[] = [];
	for (const photo of photos) {
		const day = last(days);
		if (day?.date.equals(photo.date) === true) {
			day.photos.push(photo);
		} else {
			days.push({ date: photo.date, photos: [photo] });
		}
	}
	return days;
}

/** State and actions of the progress photo screens: the list, adding, removing, and images. */
export class PhotoGallery {
	photos: readonly ProgressPhoto[] = $state([]);
	readonly days = $derived(photosByDay(this.photos));
	private readonly urls: ImageUrlCache;

	constructor(
		private readonly useCases: PhotoGalleryUseCases,
		private readonly clock: Clock,
		imageUrls: ImageUrls
	) {
		this.urls = new ImageUrlCache(imageUrls);
	}

	/** Today's date: the default and the latest allowed date of a new photo. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** Loads the photos, newest first. */
	async load(): Promise<void> {
		this.photos = await this.useCases.listProgressPhotos.execute();
	}

	/**
	 * Adds a photo from a chosen file.
	 *
	 * @param image - The file's bytes.
	 * @param dateText - The date field's value, `YYYY-MM-DD`.
	 * @param pose - The chosen pose.
	 * @returns A message to show if the photo was not added.
	 */
	async add(image: Uint8Array, dateText: string, pose: Pose): Promise<string | undefined> {
		const date = LocalDate.parse(dateText);
		if (!date.ok || this.today.isBefore(date.value)) return messages.body.enterDate;
		const result = await this.useCases.addProgressPhoto.execute({ date: date.value, pose, image });
		if (!result.ok) return messages.body.notAnImage;
		await this.load();
		return undefined;
	}

	/** Removes a photo and its images. */
	async remove(photo: ProgressPhoto): Promise<void> {
		await this.useCases.deleteProgressPhoto.execute({ id: photo.id });
		await this.load();
	}

	/**
	 * The other photos of the same pose, newest first, to compare a photo with.
	 *
	 * @param photo - The photo being compared.
	 */
	comparableWith(photo: ProgressPhoto): readonly ProgressPhoto[] {
		return this.photos.filter((other) => other.pose === photo.pose && other.id !== photo.id);
	}

	/**
	 * A URL for one of a photo's images, loaded once and kept until {@link dispose}.
	 *
	 * @param photo - The photo.
	 * @param size - The full image or the thumbnail.
	 * @returns Undefined if the image file is missing.
	 */
	readonly imageUrl = (photo: ProgressPhoto, size: PhotoSize): Promise<string | undefined> =>
		this.urls.urlFor(`${photo.id}:${size}`, () =>
			this.useCases.getPhotoImage.execute({ id: photo.id, size })
		);

	/** Frees every image URL this gallery created. */
	dispose(): Promise<void> {
		return this.urls.clear();
	}
}
