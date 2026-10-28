import type { LocalDate } from '../../shared/local-date.ts';
import type { ExerciseId, WorkoutId } from './ids.ts';
import type { ActiveWorkout, FinishedWorkout, Workout } from './workout.ts';

/** Reads workouts. */
export interface WorkoutReader {
	/** The workout in progress, if any. */
	findActive(): Promise<ActiveWorkout | undefined>;
	/** A workout by id. */
	findById(id: WorkoutId): Promise<Workout | undefined>;
	/** The most recent finished workouts, newest first. */
	findRecent(limit: number): Promise<readonly FinishedWorkout[]>;
	/** The most recent finished workout that included an exercise. */
	findLastWith(exerciseId: ExerciseId): Promise<FinishedWorkout | undefined>;
	/** Every day with at least one finished workout. */
	findTrainedDates(): Promise<readonly LocalDate[]>;
}

/** Stores and removes workouts. */
export interface WorkoutWriter {
	/** Stores a whole workout, replacing any earlier version of it. */
	save(workout: Workout): Promise<void>;
	/** Removes a workout and its sets. */
	delete(id: WorkoutId): Promise<void>;
}
