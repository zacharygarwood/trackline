/**
 * The first element of a list, if there is one.
 *
 * @param items - Any readonly list.
 */
export function first<T>(items: readonly T[]): T | undefined {
	return items.at(0);
}

/**
 * The last element of a list, if there is one.
 *
 * @param items - Any readonly list.
 */
export function last<T>(items: readonly T[]): T | undefined {
	return items.at(items.length - 1);
}

/**
 * The element at a zero-based position, or undefined outside the list.
 *
 * Unlike `Array.prototype.at`, a negative position never counts from the end.
 *
 * @param items - Any readonly list.
 * @param position - Zero-based position.
 */
export function elementAt<T>(items: readonly T[], position: number): T | undefined {
	return position < 0 ? undefined : items.at(position);
}
