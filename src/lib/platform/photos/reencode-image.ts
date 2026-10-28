/** An image drawn and encoded afresh, with none of the source file's metadata. */
export interface EncodedImage {
	readonly bytes: Uint8Array;
	readonly width: number;
	readonly height: number;
}

const WEBP = 'image/webp';
const JPEG = 'image/jpeg';
const QUALITY = 0.85;

async function decode(source: Uint8Array): Promise<ImageBitmap | undefined> {
	try {
		return await createImageBitmap(new Blob([new Uint8Array(source)]));
	} catch {
		return undefined;
	}
}

/** WebP where the browser can encode it; Safari can't, and gets JPEG instead. */
async function encode(canvas: OffscreenCanvas): Promise<Blob> {
	const webp = await canvas.convertToBlob({ type: WEBP, quality: QUALITY });
	return webp.type === WEBP ? webp : canvas.convertToBlob({ type: JPEG, quality: QUALITY });
}

async function draw(bitmap: ImageBitmap, longEdge: number): Promise<EncodedImage | undefined> {
	const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');
	if (context === null) return undefined;
	context.drawImage(bitmap, 0, 0, width, height);
	const blob = await encode(canvas);
	return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
}

/**
 * Decodes an image and redraws it on a canvas at each requested size. Only
 * pixels survive the redraw, so EXIF data such as GPS location is gone. The
 * browser applies the EXIF orientation while decoding, so photos stay upright.
 *
 * @param source - The image file's bytes.
 * @param longEdges - The longest side of each copy, in pixels; smaller images are not enlarged.
 * @returns One image per requested size, or undefined if the file can't be decoded.
 */
export async function reencodeImage(
	source: Uint8Array,
	longEdges: readonly number[]
): Promise<readonly EncodedImage[] | undefined> {
	const bitmap = await decode(source);
	if (bitmap === undefined) return undefined;
	try {
		const images = await Promise.all(longEdges.map((longEdge) => draw(bitmap, longEdge)));
		return images.every((image) => image !== undefined) ? images : undefined;
	} finally {
		bitmap.close();
	}
}
