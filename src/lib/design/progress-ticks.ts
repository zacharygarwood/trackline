/** A value toward a target, drawn as a row of equal ticks. */
export interface TickInput {
	readonly value: number;
	readonly max: number;
	readonly ticks: number;
}

/**
 * Counts how many ticks of a progress row are filled.
 *
 * @param input - The amount so far, the target, and the number of ticks.
 * @returns A whole number of ticks, from none to all of them.
 */
export function filledTicks(input: TickInput): number {
	if (input.max <= 0) return 0;
	const share = Math.min(1, Math.max(0, input.value / input.max));
	return Math.round(share * input.ticks);
}
