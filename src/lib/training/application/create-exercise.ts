import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, type Result } from '../../shared/result.ts';
import { createExercise, type Exercise } from '../domain/exercise.ts';
import type { InvalidName } from '../domain/name.ts';
import type { InvalidTracking, Tracking } from '../domain/tracking.ts';
import type { Exercises } from './training-ports.ts';

/** A new exercise's name and what it tracks. */
export interface CreateExerciseCommand {
	readonly name: string;
	readonly tracking: Tracking;
}

/** Raised when the library already has an exercise with that name, ignoring case. */
export class ExerciseExists {
	/** @param existing - The exercise with that name. */
	constructor(readonly existing: Exercise) {}
}

/** Why an exercise couldn't be created. */
export type CreateExerciseProblem = InvalidName | InvalidTracking | ExerciseExists;

/** What creating an exercise needs. */
export interface CreateExercisePorts {
	readonly exercises: Exercises;
	readonly ids: IdGenerator;
}

/** Adds an exercise to the library, choosing what it tracks. */
export class CreateExercise {
	constructor(private readonly ports: CreateExercisePorts) {}

	/** @param command - The name and tracking. */
	async execute(command: CreateExerciseCommand): Promise<Result<Exercise, CreateExerciseProblem>> {
		const exercise = createExercise({ id: this.ports.ids.next(), ...command });
		if (!exercise.ok) return exercise;
		const existing = await this.ports.exercises.findByName(exercise.value.name);
		if (existing !== undefined) return err(new ExerciseExists(existing));
		await this.ports.exercises.save(exercise.value);
		return exercise;
	}
}
