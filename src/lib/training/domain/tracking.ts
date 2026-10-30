import { err, ok, type Result } from '../../shared/result.ts';
import {
	FONT_GRADES,
	GradeScale,
	ONE_TO_TEN_GRADES,
	TRACKED_FIELDS,
	TrackedField,
	V_GRADES,
	YDS_GRADES
} from './tracking.constants.ts';

/** The most grades a custom scale can have. */
export const MAX_CUSTOM_GRADES = 40;

/** The longest name of one custom grade. */
export const MAX_GRADE_LENGTH = 20;

/** The longest label for what an exercise counts, such as "Laps". */
export const MAX_COUNT_LABEL_LENGTH = 30;

/** A built-in grade scale. */
export type NamedGradeScale = Exclude<GradeScale, typeof GradeScale.custom>;

/** The grade scale of a graded exercise: a built-in one, or the user's own grades. */
export type GradeChoice =
	| { readonly scale: NamedGradeScale }
	| { readonly scale: typeof GradeScale.custom; readonly grades: readonly string[] };

/**
 * What an exercise records. Grades exist exactly when grade is tracked, and a
 * count label exactly when count is tracked.
 */
export interface Tracking {
	/** At least one field, in {@link TRACKED_FIELDS} order. */
	readonly fields: readonly TrackedField[];
	readonly grades: GradeChoice | undefined;
	/** What the count is of, such as "Laps". */
	readonly countLabel: string | undefined;
}

/** What strength exercises track, and what every exercise tracked before tracking could be chosen. */
export const WEIGHT_AND_REPS: Tracking = {
	fields: [TrackedField.weight, TrackedField.reps],
	grades: undefined,
	countLabel: undefined
};

/** Raised when tracking is empty or its grades or count label don't match its fields. */
export class InvalidTracking {
	/** @param tracking - The rejected tracking. */
	constructor(readonly tracking: Tracking) {}
}

const NAMED_GRADES: Readonly<Record<NamedGradeScale, readonly string[]>> = {
	[GradeScale.v]: V_GRADES,
	[GradeScale.yds]: YDS_GRADES,
	[GradeScale.font]: FONT_GRADES,
	[GradeScale.oneToTen]: ONE_TO_TEN_GRADES
};

/**
 * The grades of a scale, easiest first.
 *
 * @param choice - A built-in scale or custom grades.
 */
export function gradesOf(choice: GradeChoice): readonly string[] {
	return choice.scale === GradeScale.custom ? choice.grades : NAMED_GRADES[choice.scale];
}

function validCustomGrades(choice: GradeChoice): boolean {
	if (choice.scale !== GradeScale.custom) return true;
	const { grades } = choice;
	return (
		grades.length >= 1 &&
		grades.length <= MAX_CUSTOM_GRADES &&
		grades.every((grade) => grade.length >= 1 && grade.length <= MAX_GRADE_LENGTH)
	);
}

function validCountLabel(label: string | undefined, counted: boolean): boolean {
	if (!counted) return label === undefined;
	return label !== undefined && label.length >= 1 && label.length <= MAX_COUNT_LABEL_LENGTH;
}

/**
 * Checks what an exercise tracks, putting the fields in their usual order.
 *
 * @param tracking - The fields, and the grade scale and count label they need.
 */
export function createTracking(tracking: Tracking): Result<Tracking, InvalidTracking> {
	const fields = TRACKED_FIELDS.filter((field) => tracking.fields.includes(field));
	const graded = fields.includes(TrackedField.grade);
	const countLabel = tracking.countLabel?.trim();
	const valid =
		fields.length > 0 &&
		fields.length === tracking.fields.length &&
		graded === (tracking.grades !== undefined) &&
		(tracking.grades === undefined || validCustomGrades(tracking.grades)) &&
		validCountLabel(countLabel, fields.includes(TrackedField.count));
	return valid
		? ok({ fields, grades: tracking.grades, countLabel })
		: err(new InvalidTracking(tracking));
}

/**
 * Whether an exercise tracks a field.
 *
 * @param tracking - What the exercise tracks.
 * @param field - The field to look for.
 */
export function tracks(tracking: Tracking, field: TrackedField): boolean {
	return tracking.fields.includes(field);
}
