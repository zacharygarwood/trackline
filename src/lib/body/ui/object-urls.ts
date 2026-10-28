import type { ImageUrls } from './image-url-cache.ts';

/** Image URLs backed by `blob:` object URLs, which the content security policy allows for images. */
export class ObjectUrls implements ImageUrls {
	/** {@inheritDoc ImageUrls.create} */
	create(bytes: Uint8Array): string {
		return URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
	}

	/** {@inheritDoc ImageUrls.revoke} */
	revoke(url: string): void {
		URL.revokeObjectURL(url);
	}
}
