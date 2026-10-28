import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { Mass } from '../../shared/mass.ts';
import { GoalDirection } from './goal-direction.constants.ts';
import { createWeightGoal } from './weight-goal.ts';
import { WeightOutOfRange } from './weigh-in.ts';

describe('createWeightGoal', () => {
	it('sets a target and a direction', () => {
		const goal = expectOk(
			createWeightGoal({ target: expectOk(Mass.fromKg(75)), direction: GoalDirection.lose })
		);

		expect(goal.target.kilograms).toBe(75);
		expect(goal.direction).toBe(GoalDirection.lose);
	});

	it('rejects a target that is not a body weight', () => {
		expect(
			expectErr(
				createWeightGoal({ target: expectOk(Mass.fromKg(10)), direction: GoalDirection.gain })
			)
		).toBeInstanceOf(WeightOutOfRange);
	});
});
