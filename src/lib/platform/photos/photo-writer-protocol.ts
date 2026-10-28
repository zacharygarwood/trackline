import type { PhotoFile } from './photo-folder.ts';

/** Asks the photo writer worker to write files into the photo folder. */
export interface PhotoWriteRequest {
	readonly id: number;
	readonly files: readonly PhotoFile[];
}

/** The worker's answer to one write request. */
export type PhotoWriteResponse =
	| { readonly id: number; readonly ok: true }
	| { readonly id: number; readonly ok: false; readonly message: string };

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
	typeof value === 'object' && value !== null;

const isPhotoFile = (value: unknown): value is PhotoFile =>
	isRecord(value) && typeof value.name === 'string' && value.bytes instanceof Uint8Array;

/**
 * Whether a message received by the worker is a well-formed write request.
 *
 * @param value - The `data` of a received message event.
 */
export function isPhotoWriteRequest(value: unknown): value is PhotoWriteRequest {
	return (
		isRecord(value) &&
		typeof value.id === 'number' &&
		Array.isArray(value.files) &&
		value.files.every(isPhotoFile)
	);
}

/**
 * Whether a message received from the worker is a well-formed response.
 *
 * @param value - The `data` of a received message event.
 */
export function isPhotoWriteResponse(value: unknown): value is PhotoWriteResponse {
	return (
		isRecord(value) &&
		typeof value.id === 'number' &&
		(value.ok === true || (value.ok === false && typeof value.message === 'string'))
	);
}
