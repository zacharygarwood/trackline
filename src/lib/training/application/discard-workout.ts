import type { Workouts } from './training-ports.ts';

/** Throws away the workout in progress and everything logged in it. */
export class DiscardWorkout {
	constructor(private readonly workouts: Workouts) {}

	/** Deletes the workout in progress, if any. */
	async execute(): Promise<void> {
		const active = await this.workouts.findActive();
		if (active !== undefined) await this.workouts.delete(active.id);
	}
}
