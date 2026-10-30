/** What a Stats exercise card shows: the best of a measure, or a total of it. */
export const CardMeasure = {
	weight: 'weight',
	reps: 'reps',
	grade: 'grade',
	distance: 'distance',
	time: 'time',
	count: 'count'
} as const;

/** One of the {@link CardMeasure} values. */
export type CardMeasure = (typeof CardMeasure)[keyof typeof CardMeasure];
