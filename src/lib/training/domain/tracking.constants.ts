/** What an exercise records for each set or effort. */
export const TrackedField = {
	weight: 'weight',
	reps: 'reps',
	time: 'time',
	distance: 'distance',
	grade: 'grade',
	count: 'count'
} as const;

/** One of the {@link TrackedField} values. */
export type TrackedField = (typeof TrackedField)[keyof typeof TrackedField];

/** Tracked fields in the order screens show them and tracking stores them. */
export const TRACKED_FIELDS = [
	TrackedField.weight,
	TrackedField.reps,
	TrackedField.grade,
	TrackedField.distance,
	TrackedField.time,
	TrackedField.count
] as const;

/** A difficulty scale for graded efforts such as climbs. */
export const GradeScale = {
	v: 'v',
	yds: 'yds',
	font: 'font',
	oneToTen: 'one_to_ten',
	custom: 'custom'
} as const;

/** One of the {@link GradeScale} values. */
export type GradeScale = (typeof GradeScale)[keyof typeof GradeScale];

/** The grades of the V scale, easiest first. */
export const V_GRADES = [
	'VB',
	'V0',
	'V1',
	'V2',
	'V3',
	'V4',
	'V5',
	'V6',
	'V7',
	'V8',
	'V9',
	'V10',
	'V11',
	'V12',
	'V13',
	'V14',
	'V15',
	'V16',
	'V17'
] as const;

/** The grades of the Yosemite Decimal System, easiest first. */
export const YDS_GRADES = [
	'5.5',
	'5.6',
	'5.7',
	'5.8',
	'5.9',
	'5.10a',
	'5.10b',
	'5.10c',
	'5.10d',
	'5.11a',
	'5.11b',
	'5.11c',
	'5.11d',
	'5.12a',
	'5.12b',
	'5.12c',
	'5.12d',
	'5.13a',
	'5.13b',
	'5.13c',
	'5.13d',
	'5.14a',
	'5.14b',
	'5.14c',
	'5.14d',
	'5.15a',
	'5.15b',
	'5.15c',
	'5.15d'
] as const;

/** The Fontainebleau grades, easiest first. */
export const FONT_GRADES = [
	'3',
	'4',
	'5',
	'5+',
	'6A',
	'6A+',
	'6B',
	'6B+',
	'6C',
	'6C+',
	'7A',
	'7A+',
	'7B',
	'7B+',
	'7C',
	'7C+',
	'8A',
	'8A+',
	'8B',
	'8B+',
	'8C',
	'8C+',
	'9A'
] as const;

/** A plain 1 to 10 effort scale. */
export const ONE_TO_TEN_GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
