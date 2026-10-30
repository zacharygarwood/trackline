import { err, ok, type Result } from '../../shared/result.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import type { Workouts } from './training-ports.ts';

/** Raised when bringing a workout back while another one is in progress. */
export class OtherWorkoutInProgress {}

/** What to bring back. */
export interface RestoreWorkoutCommand {
	/** The workout as it was before it was finished or discarded. */
	readonly workout: ActiveWorkout;
}

/** Undoes finishing or discarding a workout: it is in progress again, exactly as it was. */
export class RestoreWorkout {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - The workout to bring back. */
	async execute(
		command: RestoreWorkoutCommand
	): Promise<Result<ActiveWorkout, OtherWorkoutInProgress>> {
		const active = await this.workouts.findActive();
		if (active !== undefined && active.id !== command.workout.id) {
			return err(new OtherWorkoutInProgress());
		}
		await this.workouts.save(command.workout);
		return ok(command.workout);
	}
}
