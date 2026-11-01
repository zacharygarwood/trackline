import type { PhotoSize } from '../application/photo-size.constants.ts';
import type { GetPhotoImage } from '../application/photos.ts';
import type { PhotoId } from '../domain/field.ts';
import { ImageUrlCache } from './image-url-cache.ts';
import { ObjectUrls } from './object-urls.ts';

/** Loads photos into URLs for `<img>`, each at most once per page, and frees them. */
export class PhotoUrls {
	private readonly cache = new ImageUrlCache(new ObjectUrls());

	constructor(private readonly getPhotoImage: GetPhotoImage) {}

	/**
	 * The URL of one of a photo's images.
	 *
	 * @param id - The photo.
	 * @param size - The full image or the thumbnail.
	 */
	url(id: PhotoId, size: PhotoSize): Promise<string | undefined> {
		return this.cache.urlFor(id + size, () => this.getPhotoImage.execute({ id, size }));
	}

	/** Frees every URL, when the page closes. */
	clear(): Promise<void> {
		return this.cache.clear();
	}
}
