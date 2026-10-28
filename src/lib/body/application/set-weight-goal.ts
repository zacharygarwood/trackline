import type { Mass } from '../../shared/mass.ts';
import type { Result } from '../../shared/result.ts';
import type { GoalDirection } from '../domain/goal-direction.constants.ts';
import type { WeightGoalWriter } from '../domain/weight-goal-repository.ts';
import { createWeightGoal, type WeightGoal } from '../domain/weight-goal.ts';
import type { WeightOutOfRange } from '../domain/weigh-in.ts';

/** The goal the user chose. */
export interface SetWeightGoalCommand {
	readonly target: Mass;
	readonly direction: GoalDirection;
}

/** Sets the active weight goal, replacing any earlier one. */
export class SetWeightGoal {
	constructor(private readonly goals: WeightGoalWriter) {}

	/**
	 * Sets the goal.
	 *
	 * @param command - The target weight and direction.
	 * @returns The new goal, or an error if the target is implausible.
	 */
	async execute(command: SetWeightGoalCommand): Promise<Result<WeightGoal, WeightOutOfRange>> {
		const result = createWeightGoal(command);
		if (result.ok) await this.goals.save(result.value);
		return result;
	}
}
