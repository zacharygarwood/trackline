import { GoalDirection } from '../domain/goal-direction.constants.ts';

/**
 * Which way a goal weight lies from the latest weight.
 *
 * @param latest - The latest weight, if any, in the target's unit.
 * @param target - The goal weight.
 */
export function directionToward(latest: number | undefined, target: number): GoalDirection {
	if (latest === undefined || target < latest) return GoalDirection.lose;
	return target > latest ? GoalDirection.gain : GoalDirection.maintain;
}
