import { err, type Result } from '../../shared/result.ts';
import { createExercise, type Exercise } from '../domain/exercise.ts';
import type { InvalidName } from '../domain/name.ts';
import { WEIGHT_AND_REPS, type InvalidTracking } from '../domain/tracking.ts';
import { addExercise, type ExerciseAlreadyInWorkout } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import type { Exercises, Workouts } from './training-ports.ts';

/** The exercise's name, as picked from the library or typed new. */
export interface AddExerciseCommand {
	readonly name: string;
}

/** Why an exercise couldn't be added. */
export type AddExerciseProblem =
	InvalidName | InvalidTracking | ExerciseAlreadyInWorkout | NoActiveWorkout;

/** What adding an exercise needs. */
export interface AddExercisePorts {
	readonly workouts: Workouts;
	readonly exercises: Exercises;
	readonly ids: IdGenerator;
}

/**
 * Adds an exercise, with no sets yet, to the workout in progress. A name not
 * in the library becomes a new exercise that tracks weight and reps.
 */
export class AddExerciseToWorkout {
	constructor(private readonly ports: AddExercisePorts) {}

	/** @param command - The exercise name. */
	async execute(command: AddExerciseCommand): Promise<Result<ActiveWorkout, AddExerciseProblem>> {
		const exercise = await this.findOrCreate(command.name);
		if (!exercise.ok) return exercise;
		return changeActiveWorkout(this.ports.workouts, (workout) =>
			addExercise(workout, { exerciseId: exercise.value.id, sets: [] })
		);
	}

	private async findOrCreate(
		name: string
	): Promise<Result<Exercise, InvalidName | InvalidTracking>> {
		const created = createExercise({ id: this.ports.ids.next(), name, tracking: WEIGHT_AND_REPS });
		if (!created.ok) return err(created.error);
		const existing = await this.ports.exercises.findByName(created.value.name);
		if (existing !== undefined) return { ok: true, value: existing };
		await this.ports.exercises.save(created.value);
		return created;
	}
}
