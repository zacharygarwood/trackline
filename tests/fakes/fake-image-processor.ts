import {
	UnreadableImage,
	type EncodedPhoto,
	type ImageProcessor
} from '../../src/lib/body/application/photo-ports.ts';
import { err, ok, type Result } from '../../src/lib/shared/result.ts';

/**
 * Stands in for canvas re-encoding: any non-empty file "decodes" to a
 * 3 × 4 image whose full and thumbnail bytes are marked copies of the input.
 * An empty file is unreadable.
 */
export class FakeImageProcessor implements ImageProcessor {
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
