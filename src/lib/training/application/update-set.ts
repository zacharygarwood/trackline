import type { Mass } from '../../shared/mass.ts';
import type { Result } from '../../shared/result.ts';
import { replaceSet, type NotInWorkout, type SetLocation } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import { createWorkoutSet, type InvalidReps } from '../domain/workout-set.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import type { Workouts } from './training-ports.ts';

/** A set's new values. */
export interface UpdateSetCommand {
	readonly location: SetLocation;
	readonly reps: number;
	readonly weight: Mass;
	readonly completed: boolean;
}

/** Changes a set's reps or weight, or checks it off. */
export class UpdateSet {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - Which set and its new values. */
	execute(
		command: UpdateSetCommand
	): Promise<Result<ActiveWorkout, InvalidReps | NotInWorkout | NoActiveWorkout>> {
		const { location, ...fields } = command;
		return changeActiveWorkout<InvalidReps | NotInWorkout>(this.workouts, (workout) => {
			const set = createWorkoutSet(fields);
			return set.ok ? replaceSet(workout, location, set.value) : set;
		});
	}
}
