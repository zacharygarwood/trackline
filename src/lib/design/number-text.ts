/**
 * The text of a number field. Svelte binds `type="number"` inputs as numbers,
 * or null when empty; screens keep what was typed as text.
 *
 * @param value - The bound value.
 */
export function numberText(value: number | string | null | undefined): string {
	return value === null || value === undefined ? '' : String(value);
}

/**
 * The value a number field shows for typed text: the number, or null for empty or unreadable text.
 *
 * @param text - The typed text.
 */
export function numberValue(text: string): number | null {
	const trimmed = text.trim();
	const value = Number(trimmed);
	return trimmed === '' || !Number.isFinite(value) ? null : value;
}
