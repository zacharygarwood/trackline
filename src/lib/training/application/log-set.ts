import type { Result } from '../../shared/result.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { addSet, type NotInWorkout } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import { createWorkoutSet, type InvalidSet, type WorkoutSet } from '../domain/workout-set.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import type { Workouts } from './training-ports.ts';

/** The exercise and what the set recorded. */
export interface LogSetCommand {
	readonly exerciseId: ExerciseId;
	readonly measures: Omit<WorkoutSet, 'completed'>;
}

/** Records a finished set or effort at the end of an exercise in the workout in progress. */
export class LogSet {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - Which exercise and what was done. */
	execute(
		command: LogSetCommand
	): Promise<Result<ActiveWorkout, InvalidSet | NotInWorkout | NoActiveWorkout>> {
		return changeActiveWorkout<InvalidSet | NotInWorkout>(this.workouts, (workout) => {
			const set = createWorkoutSet({ ...command.measures, completed: true });
			return set.ok ? addSet(workout, command.exerciseId, set.value) : set;
		});
	}
}
