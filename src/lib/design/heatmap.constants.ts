/** Opacity of each workout heatmap shade inside the chosen range, from no workout to the longest. */
export const IN_RANGE_OPACITY: readonly number[] = Object.values({
	none: 1,
	short: 0.3,
	medium: 0.55,
	long: 0.8,
	longest: 1
});

/** The weekdays the heatmap labels with a letter, as days after Monday: Monday, Wednesday, and Friday. */
export const LETTERED_WEEKDAYS: readonly number[] = Object.values({
	monday: 0,
	wednesday: 2,
	friday: 4
});
