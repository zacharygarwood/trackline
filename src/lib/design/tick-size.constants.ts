/** How tall a row of progress ticks is, from Today's calories down to Food's macros. */
export const TickSize = {
	hero: 'hero',
	food: 'food',
	regular: 'regular',
	small: 'small'
} as const;

/** One of the {@link TickSize} values. */
export type TickSize = (typeof TickSize)[keyof typeof TickSize];
