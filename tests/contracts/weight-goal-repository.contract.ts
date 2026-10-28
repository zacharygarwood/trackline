import { describe, expect, it } from 'vitest';
import { GoalDirection } from '../../src/lib/body/domain/goal-direction.constants.ts';
import type {
	WeightGoalReader,
	WeightGoalWriter
} from '../../src/lib/body/domain/weight-goal-repository.ts';
import { Mass } from '../../src/lib/shared/mass.ts';
import { expectOk } from '../support/result.ts';

/** The behavior every weight goal repository must have. */
export function describeWeightGoalRepository(
	create: () => Promise<WeightGoalReader & WeightGoalWriter>
): void {
	describe('weight goal repository contract', () => {
		const goal = (kilograms: number, direction: GoalDirection) => ({
			target: expectOk(Mass.fromKg(kilograms)),
			direction
		});

		it('has no goal at first', async () => {
			expect(await (await create()).find()).toBeUndefined();
		});

		it('keeps only the latest goal', async () => {
			const repository = await create();
			await repository.save(goal(75, GoalDirection.lose));
			await repository.save(goal(85, GoalDirection.gain));

			const found = await repository.find();

			expect(found?.target.kilograms).toBe(85);
			expect(found?.direction).toBe(GoalDirection.gain);
		});

		it('clears the goal', async () => {
			const repository = await create();
			await repository.save(goal(75, GoalDirection.maintain));

			await repository.clear();

			expect(await repository.find()).toBeUndefined();
		});
	});
}
