import { reencodeImage } from '../../platform/photos/reencode-image.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { UnreadableImage, type ImageProcessor } from '../application/photo-ports.ts';

/** The longest side of a thumbnail: sharp in a three-column grid on a high-density phone. */
const THUMBNAIL_LONG_EDGE = 480;

/** Draws thumbnails on a canvas. */
export class CanvasImageProcessor implements ImageProcessor {
	/** {@inheritDoc ImageProcessor.thumbnail} */
	async thumbnail(image: Uint8Array): Promise<Result<Uint8Array, UnreadableImage>> {
		const thumbnail = await reencodeImage(image, THUMBNAIL_LONG_EDGE);
		return thumbnail === undefined ? err(new UnreadableImage()) : ok(thumbnail);
	}
}
