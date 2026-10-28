import type { Exercise } from './exercise.ts';

/** Reads the exercise library. */
export interface ExerciseReader {
	/** Every exercise, sorted by name. */
	findAll(): Promise<readonly Exercise[]>;
	/** The exercise with this name, ignoring case, if any. */
	findByName(name: string): Promise<Exercise | undefined>;
}

/** Adds exercises to the library. */
export interface ExerciseWriter {
	/** Stores an exercise; names must stay unique, ignoring case. */
	save(exercise: Exercise): Promise<void>;
}
