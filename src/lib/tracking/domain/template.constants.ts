/** The basic templates: plain building blocks, such as photos of anything, that the user names. */
export const BasicKey = {
	photos: 'photos',
	number: 'number',
	done: 'done',
	time: 'time',
	rating: 'rating',
	notes: 'notes',
	collection: 'collection'
} as const;

/** One of the {@link BasicKey} values. */
export type BasicKey = (typeof BasicKey)[keyof typeof BasicKey];

/** The basic and ready-made trackers onboarding and Add tracker offer. */
export const TemplateKey = {
	...BasicKey,
	workouts: 'workouts',
	running: 'running',
	steps: 'steps',
	weight: 'weight',
	bodyPhotos: 'body_photos',
	food: 'food',
	water: 'water',
	coffee: 'coffee',
	sleep: 'sleep',
	mood: 'mood',
	meditation: 'meditation',
	journal: 'journal',
	reading: 'reading',
	plants: 'plants',
	vitamins: 'vitamins'
} as const;

/** One of the {@link TemplateKey} values. */
export type TemplateKey = (typeof TemplateKey)[keyof typeof TemplateKey];

/**
 * The plain groups templates are offered in. Basic templates are plain
 * building blocks, such as photos of anything, that the user names.
 */
export const TemplateGroup = {
	basic: 'basic',
	move: 'move',
	body: 'body',
	eat: 'eat',
	mind: 'mind',
	life: 'life'
} as const;

/** One of the {@link TemplateGroup} values. */
export type TemplateGroup = (typeof TemplateGroup)[keyof typeof TemplateGroup];

/** The keys of the fields templates use. Each names its label in the messages. */
export const TemplateField = {
	reps: 'reps',
	weight: 'weight',
	time: 'time',
	distance: 'distance',
	steps: 'steps',
	photo: 'photo',
	note: 'note',
	servings: 'servings',
	calories: 'calories',
	protein: 'protein',
	carbs: 'carbs',
	fat: 'fat',
	glasses: 'glasses',
	cups: 'cups',
	quality: 'quality',
	mood: 'mood',
	watered: 'watered',
	taken: 'taken',
	amount: 'amount',
	done: 'done',
	rating: 'rating'
} as const;

/** One of the {@link TemplateField} values. */
export type TemplateField = (typeof TemplateField)[keyof typeof TemplateField];

/** The unit labels of the plain number fields templates use. Each names its text in the messages. */
export const TemplateUnit = {
	reps: 'reps',
	steps: 'steps',
	servings: 'servings',
	kcal: 'kcal',
	grams: 'g',
	glasses: 'glasses',
	cups: 'cups'
} as const;

/** One of the {@link TemplateUnit} values. */
export type TemplateUnit = (typeof TemplateUnit)[keyof typeof TemplateUnit];

/** The exercises a new workout tracker starts its library with. */
export const StarterExercise = {
	squat: 'squat',
	benchPress: 'bench_press',
	deadlift: 'deadlift',
	overheadPress: 'overhead_press',
	row: 'row',
	pullUp: 'pull_up',
	pushUp: 'push_up',
	plank: 'plank'
} as const;

/** One of the {@link StarterExercise} values. */
export type StarterExercise = (typeof StarterExercise)[keyof typeof StarterExercise];
