import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { err, type Result } from '../../shared/result.ts';
import { createExercise, type Exercise } from '../domain/exercise.ts';
import { GradeScale, TRACKED_FIELDS, type TrackedField } from '../domain/tracking.constants.ts';
import type { GradeChoice, Tracking } from '../domain/tracking.ts';
import { TrainingTable } from './training.sql.ts';
import type { ExerciseRow } from './training.row.ts';

const FIELD_SEPARATOR = ',';

const corrupt = () => err(new CorruptRow(TrainingTable.exercise, CorruptReason.invalidValue));

const isNullableText = (value: unknown): value is string | null =>
	value === null || typeof value === 'string';

function optionalColumns(
	row: SqlRow
): Omit<ExerciseRow, 'id' | 'name' | 'tracked_fields'> | undefined {
	const { grade_scale, custom_grades, count_label } = row;
	if (!isNullableText(grade_scale) || !isNullableText(custom_grades)) return undefined;
	return isNullableText(count_label) ? { grade_scale, custom_grades, count_label } : undefined;
}

function exerciseRow(row: SqlRow): ExerciseRow | undefined {
	const { id, name, tracked_fields } = row;
	if (typeof id !== 'string' || typeof name !== 'string' || typeof tracked_fields !== 'string') {
		return undefined;
	}
	const optional = optionalColumns(row);
	return optional === undefined ? undefined : { id, name, tracked_fields, ...optional };
}

function fieldsOf(text: string): readonly TrackedField[] | undefined {
	const fields = text
		.split(FIELD_SEPARATOR)
		.map((name) => TRACKED_FIELDS.find((field) => field === name));
	return fields.every((field) => field !== undefined) ? fields : undefined;
}

function customGradesOf(text: string): readonly string[] | undefined {
	try {
		const parsed: unknown = JSON.parse(text);
		return Array.isArray(parsed) && parsed.every((grade) => typeof grade === 'string')
			? parsed.filter((grade): grade is string => typeof grade === 'string')
			: undefined;
	} catch {
		return undefined;
	}
}

function gradesOf(row: ExerciseRow): GradeChoice | undefined | null {
	if (row.grade_scale === null) return undefined;
	if (row.grade_scale === GradeScale.custom) {
		const grades = row.custom_grades === null ? undefined : customGradesOf(row.custom_grades);
		return grades === undefined ? null : { scale: GradeScale.custom, grades };
	}
	const scale = Object.values(GradeScale).find(
		(known) => known === row.grade_scale && known !== GradeScale.custom
	);
	return scale === undefined || scale === GradeScale.custom ? null : { scale };
}

function trackingOf(row: ExerciseRow): Tracking | undefined {
	const fields = fieldsOf(row.tracked_fields);
	const grades = gradesOf(row);
	if (fields === undefined || grades === null) return undefined;
	return { fields, grades, countLabel: row.count_label ?? undefined };
}

/** Converts between exercises and `exercise` rows. */
export const exerciseMapper = {
	/** @param row - A row with the columns of {@link ExerciseRow}. */
	toDomain(row: SqlRow): Result<Exercise, CorruptRow> {
		const parsed = exerciseRow(row);
		const id = parsed === undefined ? undefined : parseId<'Exercise'>(parsed.id);
		const tracking = parsed === undefined ? undefined : trackingOf(parsed);
		if (parsed === undefined || id?.ok !== true || tracking === undefined) return corrupt();
		const exercise = createExercise({ id: id.value, name: parsed.name, tracking });
		return exercise.ok ? exercise : corrupt();
	},

	/** @param exercise - The exercise to store. */
	toRow(exercise: Exercise): ExerciseRow {
		const { grades, fields, countLabel } = exercise.tracking;
		return {
			id: exercise.id,
			name: exercise.name,
			tracked_fields: fields.join(FIELD_SEPARATOR),
			grade_scale: grades?.scale ?? null,
			custom_grades: grades?.scale === GradeScale.custom ? JSON.stringify(grades.grades) : null,
			count_label: countLabel ?? null
		};
	}
};
