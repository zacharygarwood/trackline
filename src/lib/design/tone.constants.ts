/** The colors a badge, ring, or bar can take: the accent, rest days, or one of the macros. */
export const Tone = {
	accent: 'accent',
	rest: 'rest',
	protein: 'protein',
	carbs: 'carbs',
	fat: 'fat'
} as const;

/** One of the {@link Tone} values. */
export type Tone = (typeof Tone)[keyof typeof Tone];
