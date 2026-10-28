import type { WeightGoalReader } from '../domain/weight-goal-repository.ts';
import type { WeightGoal } from '../domain/weight-goal.ts';

/** Reads the active weight goal. */
export class GetWeightGoal {
	constructor(private readonly goals: WeightGoalReader) {}

	/** @returns The active goal, or undefined if none is set. */
	execute(): Promise<WeightGoal | undefined> {
		return this.goals.find();
	}
}
