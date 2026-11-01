import type { Exercise } from './exercise.ts';
import type { ExerciseId } from './ids.ts';

/** Reads the exercise library. */
export interface ExerciseReader {
	/** Every exercise not deleted, sorted by name. */
	findAll(): Promise<readonly Exercise[]>;
	/**
	 * Every exercise, most recently used in a workout first. Exercises never
	 * used come first, newest first, so one just created is at the top.
	 */
	findAllByRecentUse(): Promise<readonly Exercise[]>;
	/** The exercise with this name, ignoring case, if any, even a deleted one. */
	findByName(name: string): Promise<Exercise | undefined>;
}

/** Adds exercises to the library. */
export interface ExerciseWriter {
	/** Stores an exercise; names must stay unique, ignoring case. */
	save(exercise: Exercise): Promise<void>;
	/** Hides an exercise from the library; workouts that used it keep it. */
	archive(id: ExerciseId): Promise<void>;
	/**
	 * Shows a hidden exercise in the library again.
	 *
	 * @returns Whether it was hidden.
	 */
	restore(id: ExerciseId): Promise<boolean>;
}
