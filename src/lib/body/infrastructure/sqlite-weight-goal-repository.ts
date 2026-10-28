import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { WeightGoalReader, WeightGoalWriter } from '../domain/weight-goal-repository.ts';
import type { WeightGoal } from '../domain/weight-goal.ts';
import { CLEAR_WEIGHT_GOAL, FIND_WEIGHT_GOAL, saveWeightGoal } from './body.sql.ts';
import { weightGoalMapper } from './weight-goal.mapper.ts';

/** The weight goal stored in the single-row `weight_goal` table. */
export class SqliteWeightGoalRepository implements WeightGoalReader, WeightGoalWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc WeightGoalReader.find} */
	async find(): Promise<WeightGoal | undefined> {
		const row = first(await this.database.query(FIND_WEIGHT_GOAL));
		return row === undefined ? undefined : requireValidRow(weightGoalMapper.toDomain(row));
	}

	/** {@inheritDoc WeightGoalWriter.save} */
	async save(goal: WeightGoal): Promise<void> {
		await this.database.execute(saveWeightGoal(weightGoalMapper.toRow(goal)));
	}

	/** {@inheritDoc WeightGoalWriter.clear} */
	async clear(): Promise<void> {
		await this.database.execute(CLEAR_WEIGHT_GOAL);
	}
}
