import { reencodeImage } from '../../platform/photos/reencode-image.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import {
	UnreadableImage,
	type EncodedPhoto,
	type ImageProcessor
} from '../application/photo-ports.ts';

/** The longest side of a stored photo, in pixels. */
const FULL_LONG_EDGE = 2048;

/** The longest side of a thumbnail: sharp in a three-column grid on a high-density phone. */
const THUMBNAIL_LONG_EDGE = 480;

/** Re-encodes photos by redrawing them on a canvas, which drops all metadata. */
export class CanvasImageProcessor implements ImageProcessor {
	/** {@inheritDoc ImageProcessor.reencode} */
	async reencode(image: Uint8Array): Promise<Result<EncodedPhoto, UnreadableImage>> {
		const [full, thumbnail] =
			(await reencodeImage(image, [FULL_LONG_EDGE, THUMBNAIL_LONG_EDGE])) ?? [];
		if (full === undefined || thumbnail === undefined) return err(new UnreadableImage());
		return ok({
			full: full.bytes,
			thumbnail: thumbnail.bytes,
			width: full.width,
			height: full.height
		});
	}
}
