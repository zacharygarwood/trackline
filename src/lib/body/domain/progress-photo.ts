import type { Id } from '../../shared/id.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { Pose } from './pose.constants.ts';

/** Identifies a progress photo; its image files are stored under this id. */
export type ProgressPhotoId = Id<'ProgressPhoto'>;

/**
 * A progress photo of a pose on a date. The image itself lives in the photo
 * store, never in this model.
 */
export interface ProgressPhoto {
	readonly id: ProgressPhotoId;
	readonly date: LocalDate;
	readonly pose: Pose;
	/** The stored image's width in pixels. */
	readonly width: number;
	/** The stored image's height in pixels. */
	readonly height: number;
}

/** Raised when an image's width or height is not a positive whole number of pixels. */
export class InvalidPhotoSize {
	/**
	 * @param width - The rejected width.
	 * @param height - The rejected height.
	 */
	constructor(
		readonly width: number,
		readonly height: number
	) {}
}

const isPixelCount = (value: number) => Number.isInteger(value) && value > 0;

/**
 * Creates a progress photo.
 *
 * @param fields - The photo's id, date, pose, and image size.
 */
export function createProgressPhoto(
	fields: ProgressPhoto
): Result<ProgressPhoto, InvalidPhotoSize> {
	return isPixelCount(fields.width) && isPixelCount(fields.height)
		? ok({ ...fields })
		: err(new InvalidPhotoSize(fields.width, fields.height));
}
