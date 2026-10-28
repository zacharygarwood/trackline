import type { WeightGoalWriter } from '../domain/weight-goal-repository.ts';

/** Removes the active weight goal. */
export class ClearWeightGoal {
	constructor(private readonly goals: WeightGoalWriter) {}

	/** Clears the goal; does nothing if none is set. */
	async execute(): Promise<void> {
		await this.goals.clear();
	}
}
