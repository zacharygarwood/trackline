import type { ExerciseReader } from '../domain/exercise-repository.ts';
import type { Exercise } from '../domain/exercise.ts';

/** Lists the exercise library, for picking one to add and for naming exercises in a workout. */
export class ListExercises {
	constructor(private readonly exercises: ExerciseReader) {}

	/** @returns Every exercise, sorted by name. */
	execute(): Promise<readonly Exercise[]> {
		return this.exercises.findAll();
	}
}
