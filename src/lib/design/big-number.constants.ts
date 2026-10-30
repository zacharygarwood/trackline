/**
 * How large a {@link BigNumber} is drawn: Today's calories (`hero`), Food's
 * calories (`large`), a section's figure (`stat`), Today's macros (`macro`),
 * or Food's macros (`figure`).
 */
export const NumberSize = {
	hero: 'hero',
	large: 'large',
	stat: 'stat',
	macro: 'macro',
	figure: 'figure'
} as const;

/** One of the {@link NumberSize} values. */
export type NumberSize = (typeof NumberSize)[keyof typeof NumberSize];
