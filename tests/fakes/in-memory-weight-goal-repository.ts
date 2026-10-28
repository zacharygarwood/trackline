import type {
	WeightGoalReader,
	WeightGoalWriter
} from '../../src/lib/body/domain/weight-goal-repository.ts';
import type { WeightGoal } from '../../src/lib/body/domain/weight-goal.ts';

/** The weight goal kept in a field; passes the same contract suite as the SQLite repository. */
export class InMemoryWeightGoalRepository implements WeightGoalReader, WeightGoalWriter {
	private goal: WeightGoal | undefined;

	find(): Promise<WeightGoal | undefined> {
		return Promise.resolve(this.goal);
	}

	save(goal: WeightGoal): Promise<void> {
		this.goal = goal;
		return Promise.resolve();
	}

	clear(): Promise<void> {
		this.goal = undefined;
		return Promise.resolve();
	}
}
