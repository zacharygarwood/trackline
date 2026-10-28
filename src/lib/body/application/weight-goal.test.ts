import { describe, expect, it } from 'vitest';
import { InMemoryWeightGoalRepository } from '../../../../tests/fakes/in-memory-weight-goal-repository.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { Mass } from '../../shared/mass.ts';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import { WeightOutOfRange } from '../domain/weigh-in.ts';
import { ClearWeightGoal } from './clear-weight-goal.ts';
import { GetWeightGoal } from './get-weight-goal.ts';
import { SetWeightGoal } from './set-weight-goal.ts';

describe('weight goal use cases', () => {
	it('sets and reads a goal', async () => {
		const repository = new InMemoryWeightGoalRepository();

		const goal = expectOk(
			await new SetWeightGoal(repository).execute({
				target: expectOk(Mass.fromKg(75)),
				direction: GoalDirection.lose
			})
		);

		expect(await new GetWeightGoal(repository).execute()).toEqual(goal);
	});

	it('rejects an implausible target and keeps the old goal', async () => {
		const repository = new InMemoryWeightGoalRepository();

		const error = expectErr(
			await new SetWeightGoal(repository).execute({
				target: expectOk(Mass.fromKg(5)),
				direction: GoalDirection.lose
			})
		);

		expect(error).toBeInstanceOf(WeightOutOfRange);
		expect(await repository.find()).toBeUndefined();
	});

	it('clears the goal', async () => {
		const repository = new InMemoryWeightGoalRepository();
		await new SetWeightGoal(repository).execute({
			target: expectOk(Mass.fromKg(75)),
			direction: GoalDirection.maintain
		});

		await new ClearWeightGoal(repository).execute();

		expect(await new GetWeightGoal(repository).execute()).toBeUndefined();
	});
});
