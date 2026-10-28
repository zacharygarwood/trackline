import type { Result } from '../../shared/result.ts';
import { removeSet, type NotInWorkout, type SetLocation } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import type { Workouts } from './training-ports.ts';

/** Which set to remove. */
export interface RemoveSetCommand {
	readonly location: SetLocation;
}

/** Removes a set from the workout in progress. */
export class RemoveSet {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - The set. */
	execute(
		command: RemoveSetCommand
	): Promise<Result<ActiveWorkout, NotInWorkout | NoActiveWorkout>> {
		return changeActiveWorkout(this.workouts, (workout) => removeSet(workout, command.location));
	}
}
