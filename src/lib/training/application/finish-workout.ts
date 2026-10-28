import type { Clock } from '../../shared/clock.ts';
import { err, type Result } from '../../shared/result.ts';
import type { RestDayWriter } from '../domain/rest-day-repository.ts';
import { finishWorkout, type FinishedWorkout, type NoCompletedSets } from '../domain/workout.ts';
import { NoActiveWorkout } from './active-workout.ts';
import type { Workouts } from './training-ports.ts';

/** What finishing a workout needs. */
export interface FinishWorkoutPorts {
	readonly workouts: Workouts;
	readonly restDays: RestDayWriter;
	readonly clock: Clock;
}

/**
 * Finishes the workout in progress. A workout with no completed sets is
 * discarded. A finished workout replaces a rest day on the same date.
 */
export class FinishWorkout {
	constructor(private readonly ports: FinishWorkoutPorts) {}

	/** @returns The finished workout, or why there was none to keep. */
	async execute(): Promise<Result<FinishedWorkout, NoActiveWorkout | NoCompletedSets>> {
		const { workouts, restDays, clock } = this.ports;
		const active = await workouts.findActive();
		if (active === undefined) return err(new NoActiveWorkout());
		const finished = finishWorkout(active, clock.now());
		if (finished.ok) {
			await workouts.save(finished.value);
			await restDays.deleteOn(finished.value.date);
		} else {
			await workouts.delete(active.id);
		}
		return finished;
	}
}
