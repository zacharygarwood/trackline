import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import { LocalDate } from '../../shared/local-date.ts';
import type { ExerciseId, WorkoutId } from '../domain/ids.ts';
import type { WorkoutReader, WorkoutWriter } from '../domain/workout-repository.ts';
import { WorkoutStatus } from '../domain/workout-status.constants.ts';
import type { ActiveWorkout, FinishedWorkout, Workout } from '../domain/workout.ts';
import {
	clearWorkoutExercises,
	deleteWorkout,
	FIND_ACTIVE_WORKOUT,
	FIND_TRAINED_DATES,
	findLastWorkoutWith,
	findRecentWorkouts,
	findWorkoutById,
	findWorkoutExercises,
	findWorkoutSets,
	insertWorkoutExercise,
	insertWorkoutSet,
	upsertWorkout
} from './training.sql.ts';
import { workoutMapper } from './workout.mapper.ts';

const isFinished = (workout: Workout): workout is FinishedWorkout =>
	workout.status === WorkoutStatus.finished;

/** Workouts in the `workout`, `workout_exercise`, and `workout_set` tables. */
export class SqliteWorkoutRepository implements WorkoutReader, WorkoutWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc WorkoutReader.findActive} */
	async findActive(): Promise<ActiveWorkout | undefined> {
		const workout = await this.loadFirst(await this.database.query(FIND_ACTIVE_WORKOUT));
		return workout?.status === WorkoutStatus.active ? workout : undefined;
	}

	/** {@inheritDoc WorkoutReader.findById} */
	async findById(id: WorkoutId): Promise<Workout | undefined> {
		return this.loadFirst(await this.database.query(findWorkoutById(id)));
	}

	/** {@inheritDoc WorkoutReader.findRecent} */
	async findRecent(limit: number): Promise<readonly FinishedWorkout[]> {
		const rows = await this.database.query(findRecentWorkouts(limit));
		return (await Promise.all(rows.map((row) => this.load(row)))).filter(isFinished);
	}

	/** {@inheritDoc WorkoutReader.findLastWith} */
	async findLastWith(exerciseId: ExerciseId): Promise<FinishedWorkout | undefined> {
		const workout = await this.loadFirst(
			await this.database.query(findLastWorkoutWith(exerciseId))
		);
		return workout !== undefined && isFinished(workout) ? workout : undefined;
	}

	/**
	 * {@inheritDoc WorkoutReader.findTrainedDates}
	 *
	 * @throws If a stored date is corrupt.
	 */
	async findTrainedDates(): Promise<readonly LocalDate[]> {
		const rows = await this.database.query(FIND_TRAINED_DATES);
		return rows.map((row) => {
			const date = typeof row.date === 'string' ? LocalDate.parse(row.date) : undefined;
			if (date?.ok !== true) throw new Error('Corrupt workout row: date');
			return date.value;
		});
	}

	/** {@inheritDoc WorkoutWriter.save} */
	async save(workout: Workout): Promise<void> {
		const rows = workoutMapper.toRows(workout);
		await this.database.transaction([
			upsertWorkout(rows.workout),
			clearWorkoutExercises(workout.id),
			...rows.exercises.map(insertWorkoutExercise),
			...rows.sets.map(insertWorkoutSet)
		]);
	}

	/** {@inheritDoc WorkoutWriter.delete} */
	async delete(id: WorkoutId): Promise<void> {
		await this.database.execute(deleteWorkout(id));
	}

	private async loadFirst(rows: readonly SqlRow[]): Promise<Workout | undefined> {
		const row = first(rows);
		return row === undefined ? undefined : this.load(row);
	}

	private async load(row: SqlRow): Promise<Workout> {
		const id = typeof row.id === 'string' ? row.id : '';
		const [exercises, sets] = await Promise.all([
			this.database.query(findWorkoutExercises(id)),
			this.database.query(findWorkoutSets(id))
		]);
		return requireValidRow(workoutMapper.toDomain({ workout: row, exercises, sets }));
	}
}
