/** Where a tracker's numbers come from. */
export const TrackerSource = {
	food: 'food',
	workouts: 'workouts',
	weight: 'weight',
	log: 'log'
} as const;

/** One of the {@link TrackerSource} values. */
export type TrackerSource = (typeof TrackerSource)[keyof typeof TrackerSource];

/** What a tracker measures. Each belongs to one {@link TrackerSource}. */
export const Measure = {
	calories: 'calories',
	protein: 'protein',
	carbs: 'carbs',
	fat: 'fat',
	food: 'food',
	workouts: 'workouts',
	sessions: 'sessions',
	distance: 'distance',
	time: 'time',
	reps: 'reps',
	sets: 'sets',
	weight: 'weight',
	number: 'number',
	duration: 'duration',
	rating: 'rating',
	done: 'done'
} as const;

/** One of the {@link Measure} values. */
export type Measure = (typeof Measure)[keyof typeof Measure];

/** The measures of each source, in the order the builder offers them. */
export const MEASURES_BY_SOURCE = {
	food: [Measure.calories, Measure.protein, Measure.carbs, Measure.fat, Measure.food],
	workouts: [
		Measure.workouts,
		Measure.sessions,
		Measure.distance,
		Measure.time,
		Measure.reps,
		Measure.sets
	],
	weight: [Measure.weight],
	log: [Measure.number, Measure.duration, Measure.rating, Measure.done]
} as const satisfies Readonly<Record<TrackerSource, readonly Measure[]>>;

/** The food log's macro measures. */
export type MacroMeasure =
	typeof Measure.calories | typeof Measure.protein | typeof Measure.carbs | typeof Measure.fat;

/** The measures of one exercise. */
export type ExerciseMeasure =
	| typeof Measure.sessions
	| typeof Measure.distance
	| typeof Measure.time
	| typeof Measure.reps
	| typeof Measure.sets;

/** The measures read from one chosen food or exercise. */
export const SUBJECT_MEASURES: readonly Measure[] = [
	Measure.food,
	Measure.sessions,
	Measure.distance,
	Measure.time,
	Measure.reps,
	Measure.sets
];

/** Whether the goal is a minimum to reach or a limit to stay under. */
export const Direction = {
	atLeast: 'at_least',
	atMost: 'at_most'
} as const;

/** One of the {@link Direction} values. */
export type Direction = (typeof Direction)[keyof typeof Direction];

/** Whether a tracker counts each day or each week. */
export const Period = {
	day: 'day',
	week: 'week'
} as const;

/** One of the {@link Period} values. */
export type Period = (typeof Period)[keyof typeof Period];

/** How a logged tracker turns its entries in a period into one number. */
export const Combine = {
	total: 'total',
	average: 'average',
	days: 'days'
} as const;

/** One of the {@link Combine} values. */
export type Combine = (typeof Combine)[keyof typeof Combine];

/** The fields of a tracker that can be invalid. */
export const TrackerField = {
	name: 'name',
	unit: 'unit',
	goal: 'goal',
	subject: 'subject'
} as const;

/** One of the {@link TrackerField} values. */
export type TrackerField = (typeof TrackerField)[keyof typeof TrackerField];
