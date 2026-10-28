/** Turns image bytes into URLs an `<img>` can show, and frees them. */
export interface ImageUrls {
	/** A URL showing the image. */
	create(bytes: Uint8Array): string;
	/** Frees a URL from {@link ImageUrls.create}. */
	revoke(url: string): void;
}

/**
 * Loads each image into a URL at most once and frees them all together. It is
 * deliberately not reactive: screens read it while rendering.
 */
export class ImageUrlCache {
	private readonly urls = new Map<string, Promise<string | undefined>>();

	constructor(private readonly imageUrls: ImageUrls) {}

	/**
	 * The URL for a key, loading the image the first time.
	 *
	 * @param key - Identifies the image.
	 * @param load - Reads the image's bytes; undefined if it is missing.
	 */
	urlFor(key: string, load: () => Promise<Uint8Array | undefined>): Promise<string | undefined> {
		const cached = this.urls.get(key);
		if (cached !== undefined) return cached;
		const url = load().then((bytes) =>
			bytes === undefined ? undefined : this.imageUrls.create(bytes)
		);
		this.urls.set(key, url);
		return url;
	}

	/** Frees every URL created so far. */
	async clear(): Promise<void> {
		const loaded = await Promise.all(this.urls.values());
		this.urls.clear();
		for (const url of loaded) if (url !== undefined) this.imageUrls.revoke(url);
	}
}
