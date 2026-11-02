/** The kind of value a field holds. */
export const FieldType = {
	number: 'number',
	duration: 'duration',
	rating: 'rating',
	check: 'check',
	choice: 'choice',
	note: 'note',
	photo: 'photo'
} as const;

/** One of the {@link FieldType} values. */
export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/** What a number field measures: a plain amount with its own unit label, a mass, or a distance. */
export const Dimension = {
	plain: 'plain',
	mass: 'mass',
	distance: 'distance'
} as const;

/** One of the {@link Dimension} values. */
export type Dimension = (typeof Dimension)[keyof typeof Dimension];

/** Which purpose-built page a tracker opens, and whether it has subjects and sessions. */
export const TrackerKind = {
	log: 'log',
	photos: 'photos',
	collection: 'collection',
	workout: 'workout',
	food: 'food'
} as const;

/** One of the {@link TrackerKind} values. */
export type TrackerKind = (typeof TrackerKind)[keyof typeof TrackerKind];

/** Whether a tracker's entries name a subject from its library. */
export const SubjectUse = {
	none: 'none',
	optional: 'optional',
	required: 'required'
} as const;

/** One of the {@link SubjectUse} values. */
export type SubjectUse = (typeof SubjectUse)[keyof typeof SubjectUse];

/** How each kind of tracker uses subjects and sessions, and which field type it must have. */
export const KIND_RULES = {
	log: { subjects: SubjectUse.none, sessions: false, needs: undefined },
	photos: { subjects: SubjectUse.none, sessions: false, needs: FieldType.photo },
	collection: { subjects: SubjectUse.required, sessions: false, needs: undefined },
	workout: { subjects: SubjectUse.required, sessions: true, needs: undefined },
	food: { subjects: SubjectUse.optional, sessions: false, needs: FieldType.number }
} as const satisfies Readonly<
	Record<TrackerKind, { subjects: SubjectUse; sessions: boolean; needs: FieldType | undefined }>
>;

/** Whether a goal counts something each period or moves one value toward a target. */
export const GoalType = {
	period: 'period',
	target: 'target'
} as const;

/** One of the {@link GoalType} values. */
export type GoalType = (typeof GoalType)[keyof typeof GoalType];

/** Whether Stats charts a count each period or the trend of a field's latest value. */
export const StatType = {
	counts: 'counts',
	trend: 'trend'
} as const;

/** One of the {@link StatType} values. */
export type StatType = (typeof StatType)[keyof typeof StatType];

/** What a period goal counts in each day, week, or month. */
export const Measure = {
	total: 'total',
	average: 'average',
	entries: 'entries',
	days: 'days',
	sessions: 'sessions'
} as const;

/** One of the {@link Measure} values. */
export type Measure = (typeof Measure)[keyof typeof Measure];

/** The span a period goal resets over. */
export const Period = {
	day: 'day',
	week: 'week',
	month: 'month'
} as const;

/** One of the {@link Period} values. */
export type Period = (typeof Period)[keyof typeof Period];

/** Whether a goal is a minimum to reach or a limit to stay under. */
export const Direction = {
	atLeast: 'at_least',
	atMost: 'at_most'
} as const;

/** One of the {@link Direction} values. */
export type Direction = (typeof Direction)[keyof typeof Direction];

/** The pictures a tracker can show on Home and in its header. */
export const TrackerIcon = {
	dumbbell: 'dumbbell',
	run: 'run',
	steps: 'steps',
	scale: 'scale',
	camera: 'camera',
	food: 'food',
	water: 'water',
	coffee: 'coffee',
	moon: 'moon',
	smile: 'smile',
	leaf: 'leaf',
	pill: 'pill',
	book: 'book',
	pen: 'pen',
	mind: 'mind',
	hash: 'hash',
	check: 'check',
	clock: 'clock',
	star: 'star',
	box: 'box'
} as const;

/** One of the {@link TrackerIcon} values. */
export type TrackerIcon = (typeof TrackerIcon)[keyof typeof TrackerIcon];

/** The parts of a tracker that can be invalid. */
export const TrackerProblem = {
	name: 'name',
	noFields: 'no_fields',
	tooManyFields: 'too_many_fields',
	duplicateField: 'duplicate_field',
	missingField: 'missing_field',
	goal: 'goal'
} as const;

/** One of the {@link TrackerProblem} values. */
export type TrackerProblem = (typeof TrackerProblem)[keyof typeof TrackerProblem];

/** The parts of a field that can be invalid. */
export const FieldProblem = {
	key: 'key',
	label: 'label',
	unit: 'unit',
	options: 'options'
} as const;

/** One of the {@link FieldProblem} values. */
export type FieldProblem = (typeof FieldProblem)[keyof typeof FieldProblem];

/** Why a thing cannot join a tracker's library. */
export const SubjectProblem = {
	notUsed: 'not_used',
	name: 'name',
	fields: 'fields',
	defaults: 'defaults',
	recipe: 'recipe'
} as const;

/** One of the {@link SubjectProblem} values. */
export type SubjectProblem = (typeof SubjectProblem)[keyof typeof SubjectProblem];

/** Why a recipe cannot be worked out: no ingredients or one not in the library, or a bad amount. */
export const RecipeProblem = {
	ingredients: 'ingredients',
	amount: 'amount'
} as const;

/** One of the {@link RecipeProblem} values. */
export type RecipeProblem = (typeof RecipeProblem)[keyof typeof RecipeProblem];

/** Whether a session is under way or done. */
export const SessionState = {
	active: 'active',
	finished: 'finished'
} as const;

/** One of the {@link SessionState} values. */
export type SessionState = (typeof SessionState)[keyof typeof SessionState];

/** Why an entry cannot be logged. */
export const EntryProblem = {
	empty: 'empty',
	unknownField: 'unknown_field',
	wrongType: 'wrong_type',
	outOfRange: 'out_of_range',
	missingRequired: 'missing_required',
	subject: 'subject',
	session: 'session'
} as const;

/** One of the {@link EntryProblem} values. */
export type EntryProblem = (typeof EntryProblem)[keyof typeof EntryProblem];
