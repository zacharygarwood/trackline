import {
	UnreadableImage,
	type EncodedPhoto,
	type ImageProcessor,
	type PhotoFiles,
	type PhotoStore
} from '../../src/lib/tracking/application/photo-ports.ts';
import { PhotoSize } from '../../src/lib/tracking/application/photo-size.constants.ts';
import { err, ok, type Result } from '../../src/lib/shared/result.ts';
import type { PhotoId } from '../../src/lib/tracking/domain/field.ts';

/** A photo store that keeps files in a map. */
export class InMemoryPhotos implements PhotoStore {
	readonly files = new Map<PhotoId, PhotoFiles>();

	put(id: PhotoId, files: PhotoFiles): Promise<void> {
		this.files.set(id, files);
		return Promise.resolve();
	}

	read(id: PhotoId, size: PhotoSize): Promise<Uint8Array | undefined> {
		const files = this.files.get(id);
		return Promise.resolve(size === PhotoSize.full ? files?.full : files?.thumbnail);
	}

	delete(id: PhotoId): Promise<void> {
		this.files.delete(id);
		return Promise.resolve();
	}
}

/** Marks images instead of decoding them; an empty file is unreadable. */
export class FakeImages implements ImageProcessor {
	reencode(image: Uint8Array): Promise<Result<EncodedPhoto, UnreadableImage>> {
		if (image.length === 0) return Promise.resolve(err(new UnreadableImage()));
		return Promise.resolve(
			ok({
				full: Uint8Array.of(1, ...image),
				thumbnail: Uint8Array.of(2, ...image),
				width: 3,
				height: 4
			})
		);
	}
}
