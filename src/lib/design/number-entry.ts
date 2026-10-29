/** The values a number field accepts: from `min` to `max`; a whole `step` means whole numbers. */
export interface NumberRange {
	readonly min: number;
	readonly max: number;
	readonly step: number;
}

/**
 * Reads a value typed into a number field, accepting a comma as the decimal separator.
 *
 * @param text - What the user typed.
 * @param range - The allowed range.
 * @returns The value, kept within the range, or undefined if the text is not a number.
 */
export function parseNumberEntry(text: string, range: NumberRange): number | undefined {
	const trimmed = text.trim().replace(',', '.');
	const value = Number(trimmed);
	return trimmed === '' || !Number.isFinite(value)
		? undefined
		: Math.min(range.max, Math.max(range.min, value));
}
