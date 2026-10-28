import { err, type Result } from '../../shared/result.ts';
import { createExercise, type Exercise } from '../domain/exercise.ts';
import type { InvalidName } from '../domain/name.ts';
import { suggestNextSet } from '../domain/set-suggestion.ts';
import { addExercise, type ExerciseAlreadyInWorkout } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import { lastSessionOf } from './last-session.ts';
import type { Exercises, Workouts } from './training-ports.ts';

/** The exercise's name, as picked from the library or typed new. */
export interface AddExerciseCommand {
	readonly name: string;
}

/** Why an exercise couldn't be added. */
export type AddExerciseProblem = InvalidName | ExerciseAlreadyInWorkout | NoActiveWorkout;

/** What adding an exercise needs. */
export interface AddExercisePorts {
	readonly workouts: Workouts;
	readonly exercises: Exercises;
	readonly ids: IdGenerator;
}

/**
 * Adds an exercise to the workout in progress, creating it in the library
 * when the name is new. Its first set is pre-filled from last session.
 */
export class AddExerciseToWorkout {
	constructor(private readonly ports: AddExercisePorts) {}

	/** @param command - The exercise name. */
	async execute(command: AddExerciseCommand): Promise<Result<ActiveWorkout, AddExerciseProblem>> {
		const exercise = await this.findOrCreate(command.name);
		if (!exercise.ok) return exercise;
		const lastSession = await lastSessionOf(this.ports.workouts, exercise.value.id);
		const firstSet = suggestNextSet({ current: [], lastSession });
		return changeActiveWorkout(this.ports.workouts, (workout) =>
			addExercise(workout, { exerciseId: exercise.value.id, sets: [firstSet] })
		);
	}

	private async findOrCreate(name: string): Promise<Result<Exercise, InvalidName>> {
		const created = createExercise({ id: this.ports.ids.next(), name });
		if (!created.ok) return err(created.error);
		const existing = await this.ports.exercises.findByName(created.value.name);
		if (existing !== undefined) return { ok: true, value: existing };
		await this.ports.exercises.save(created.value);
		return created;
	}
}
