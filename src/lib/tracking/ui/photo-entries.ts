import type { Entry } from '../domain/entry.ts';
import type { PhotoId } from '../domain/field.ts';
import { photosOf } from '../domain/entry.ts';

/** An entry's first photo, for grids and compare. */
export interface PhotoEntry {
	readonly entry: Entry;
	readonly photoId: PhotoId;
}

/**
 * The entries that hold a photo, with their first photo, in the order given.
 *
 * @param entries - Logged entries.
 */
export function photoEntries(entries: readonly Entry[]): readonly PhotoEntry[] {
	return entries.flatMap((entry) => {
		const [photoId] = photosOf(entry);
		return photoId === undefined ? [] : [{ entry, photoId }];
	});
}
