import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { WorkoutTemplateId } from '../domain/ids.ts';
import { WorkoutStatus } from '../domain/workout-status.constants.ts';
import type { Workout, WorkoutExercise } from '../domain/workout.ts';
import { createWorkoutSet, type WorkoutSet } from '../domain/workout-set.ts';
import { TrainingTable } from './training.sql.ts';
import type { WorkoutExerciseRow, WorkoutRow, WorkoutSetRow } from './training.row.ts';

/** A workout's row with its exercise and set rows, as read from the database. */
export interface StoredWorkout {
	readonly workout: SqlRow;
	readonly exercises: readonly SqlRow[];
	readonly sets: readonly SqlRow[];
}

/** A workout as rows to write. */
export interface WorkoutRows {
	readonly workout: WorkoutRow;
	readonly exercises: readonly WorkoutExerciseRow[];
	readonly sets: readonly WorkoutSetRow[];
}

const corrupt = (reason: string) => err(new CorruptRow(TrainingTable.workout, reason));

const isNullableNumber = (value: unknown): value is number | null =>
	value === null || typeof value === 'number';

const isNullableText = (value: unknown): value is string | null =>
	value === null || typeof value === 'string';

function workoutRow(row: SqlRow): WorkoutRow | undefined {
	const { id, date, started_at, finished_at, note, source_template_id } = row;
	if (typeof id !== 'string' || typeof date !== 'string' || typeof note !== 'string')
		return undefined;
	if (typeof started_at !== 'number' || !isNullableNumber(finished_at)) return undefined;
	if (!isNullableText(source_template_id)) return undefined;
	return { id, date, started_at, finished_at, note, source_template_id };
}

function exerciseRow(row: SqlRow): WorkoutExerciseRow | undefined {
	const { workout_id, position, exercise_id } = row;
	return typeof workout_id === 'string' &&
		typeof position === 'number' &&
		typeof exercise_id === 'string'
		? { workout_id, position, exercise_id }
		: undefined;
}

function setOf(row: SqlRow): WorkoutSet | undefined {
	const { reps, weight_kg, completed } = row;
	if (typeof reps !== 'number' || typeof weight_kg !== 'number') return undefined;
	const weight = Mass.fromKg(weight_kg);
	const set = weight.ok
		? createWorkoutSet({ reps, weight: weight.value, completed: completed === 1 })
		: undefined;
	return set?.ok === true ? set.value : undefined;
}

function exercisesOf(stored: StoredWorkout): readonly WorkoutExercise[] | undefined {
	const exercises: WorkoutExercise[] = [];
	for (const row of stored.exercises) {
		const parsed = exerciseRow(row);
		const exerciseId = parsed === undefined ? undefined : parseId<'Exercise'>(parsed.exercise_id);
		const sets = stored.sets.filter((set) => set.exercise_position === parsed?.position).map(setOf);
		if (exerciseId?.ok !== true || sets.includes(undefined)) return undefined;
		exercises.push({ exerciseId: exerciseId.value, sets: sets.filter((set) => set !== undefined) });
	}
	return exercises;
}

function templateIdOf(value: string | null): Result<WorkoutTemplateId | undefined, unknown> {
	return value === null ? ok(undefined) : parseId<'WorkoutTemplate'>(value);
}

/** Converts between workouts and their `workout`, `workout_exercise`, and `workout_set` rows. */
export const workoutMapper = {
	/**
	 * Validates stored rows and builds the workout they describe.
	 *
	 * @param stored - The workout row with its exercise and set rows.
	 */
	toDomain(stored: StoredWorkout): Result<Workout, CorruptRow> {
		const row = workoutRow(stored.workout);
		if (row === undefined) return corrupt(CorruptReason.missingColumn);
		const id = parseId<'Workout'>(row.id);
		const date = LocalDate.parse(row.date);
		const sourceTemplateId = templateIdOf(row.source_template_id);
		const exercises = exercisesOf(stored);
		if (!id.ok || !date.ok || !sourceTemplateId.ok || exercises === undefined) {
			return corrupt(CorruptReason.invalidValue);
		}
		const fields = {
			id: id.value,
			date: date.value,
			startedAt: row.started_at,
			note: row.note,
			sourceTemplateId: sourceTemplateId.value,
			exercises
		};
		return ok(
			row.finished_at === null
				? { ...fields, status: WorkoutStatus.active }
				: { ...fields, status: WorkoutStatus.finished, finishedAt: row.finished_at }
		);
	},

	/** @param workout - The workout to store. */
	toRows(workout: Workout): WorkoutRows {
		return {
			workout: {
				id: workout.id,
				date: workout.date.toString(),
				started_at: workout.startedAt,
				finished_at: workout.status === WorkoutStatus.finished ? workout.finishedAt : null,
				note: workout.note,
				source_template_id: workout.sourceTemplateId ?? null
			},
			exercises: workout.exercises.map((exercise, position) => ({
				workout_id: workout.id,
				position,
				exercise_id: exercise.exerciseId
			})),
			sets: workout.exercises.flatMap((exercise, exercisePosition) =>
				exercise.sets.map((set, position) => ({
					workout_id: workout.id,
					exercise_position: exercisePosition,
					position,
					reps: set.reps,
					weight_kg: set.weight.kilograms,
					completed: set.completed ? 1 : 0
				}))
			)
		};
	}
};
