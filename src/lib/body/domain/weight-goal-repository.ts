import type { WeightGoal } from './weight-goal.ts';

/** Reads the active weight goal. */
export interface WeightGoalReader {
	/** The active goal, if the user has set one. */
	find(): Promise<WeightGoal | undefined>;
}

/** Sets and clears the active weight goal. */
export interface WeightGoalWriter {
	/** Makes this the active goal, replacing any earlier one. */
	save(goal: WeightGoal): Promise<void>;
	/** Removes the active goal. */
	clear(): Promise<void>;
}
