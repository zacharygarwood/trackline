import { ok, type Result } from '../../shared/result.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { removeExercise } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import type { Workouts } from './training-ports.ts';

/** Which exercise to take out of the workout. */
export interface RemoveExerciseCommand {
	readonly exerciseId: ExerciseId;
}

/** Removes an exercise and its sets from the workout in progress. */
export class RemoveExerciseFromWorkout {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - The exercise. */
	execute(command: RemoveExerciseCommand): Promise<Result<ActiveWorkout, NoActiveWorkout>> {
		return changeActiveWorkout(this.workouts, (workout) =>
			ok(removeExercise(workout, command.exerciseId))
		);
	}
}
