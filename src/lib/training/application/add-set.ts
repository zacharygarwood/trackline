import type { Result } from '../../shared/result.ts';
import type { ExerciseId } from '../domain/ids.ts';
import { suggestNextSet } from '../domain/set-suggestion.ts';
import { addSet, type NotInWorkout } from '../domain/workout-editing.ts';
import { setsOf, type ActiveWorkout } from '../domain/workout.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import { lastSessionOf } from './last-session.ts';
import type { Workouts } from './training-ports.ts';

/** Which exercise gets another set. */
export interface AddSetCommand {
	readonly exerciseId: ExerciseId;
}

/** Adds a set to an exercise, pre-filled from the set before it. */
export class AddSet {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - The exercise. */
	async execute(
		command: AddSetCommand
	): Promise<Result<ActiveWorkout, NotInWorkout | NoActiveWorkout>> {
		const lastSession = await lastSessionOf(this.workouts, command.exerciseId);
		return changeActiveWorkout(this.workouts, (workout) =>
			addSet(
				workout,
				command.exerciseId,
				suggestNextSet({ current: setsOf(workout, command.exerciseId) ?? [], lastSession })
			)
		);
	}
}
