const WEBP = 'image/webp';
const JPEG = 'image/jpeg';
const QUALITY = 0.85;
const SMOOTHING: ImageSmoothingQuality = 'high';

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

async function draw(bitmap: ImageBitmap, longEdge: number): Promise<Uint8Array | undefined> {
	const scale = Math.min(1, longEdge / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');
	if (context === null) return undefined;
	context.imageSmoothingQuality = SMOOTHING;
	context.drawImage(bitmap, 0, 0, width, height);
	const blob = await encode(canvas);
	return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Decodes an image and draws a smaller copy of it on a canvas, scaled with the
 * browser's best smoothing. The browser applies the EXIF orientation while
 * decoding, so the copy stays upright.
 *
 * @param source - The image file's bytes.
 * @param longEdge - The longest side of the copy, in pixels; smaller images are not enlarged.
 * @returns The encoded copy, or undefined if the file can't be decoded.
 */
export async function reencodeImage(
	source: Uint8Array,
	longEdge: number
): Promise<Uint8Array | undefined> {
	const bitmap = await decode(source);
	if (bitmap === undefined) return undefined;
	try {
		return await draw(bitmap, longEdge);
	} finally {
		bitmap.close();
	}
}
