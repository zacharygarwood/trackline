import type { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { GoalDirection } from './goal-direction.constants.ts';
import { isBodyWeight, WeightOutOfRange } from './weigh-in.ts';

/** The body weight the user is working toward. There is at most one active goal. */
export interface WeightGoal {
	readonly target: Mass;
	readonly direction: GoalDirection;
}

/**
 * Creates a weight goal, rejecting implausible targets.
 *
 * @param fields - The target weight and the direction to move in.
 */
export function createWeightGoal(fields: WeightGoal): Result<WeightGoal, WeightOutOfRange> {
	return isBodyWeight(fields.target) ? ok({ ...fields }) : err(new WeightOutOfRange(fields.target));
}
