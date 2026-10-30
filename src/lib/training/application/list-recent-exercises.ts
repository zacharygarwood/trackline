import type { ExerciseReader } from '../domain/exercise-repository.ts';
import type { Exercise } from '../domain/exercise.ts';

/** Lists the exercise library with the ones used most recently first, for starting or adding one quickly. */
export class ListRecentExercises {
	constructor(private readonly exercises: ExerciseReader) {}

	/** @returns Every exercise: new ones first, then by latest use. */
	execute(): Promise<readonly Exercise[]> {
		return this.exercises.findAllByRecentUse();
	}
}
