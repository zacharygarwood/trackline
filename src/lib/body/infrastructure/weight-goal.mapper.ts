import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { Mass } from '../../shared/mass.ts';
import { err, type Result } from '../../shared/result.ts';
import { GoalDirection } from '../domain/goal-direction.constants.ts';
import { createWeightGoal, type WeightGoal } from '../domain/weight-goal.ts';
import { BodyTable } from './body.sql.ts';
import type { WeightGoalRow } from './weight-goal.row.ts';

const corrupt = (reason: string) => err(new CorruptRow(BodyTable.weightGoal, reason));

const isGoalDirection = (value: string): value is GoalDirection =>
	Object.values<string>(GoalDirection).includes(value);

/** Converts between the weight goal and the `weight_goal` row. */
export const weightGoalMapper = {
	/**
	 * Validates the stored row and builds the goal it describes.
	 *
	 * @param row - A row selected with the columns of {@link WeightGoalRow}.
	 */
	toDomain(row: SqlRow): Result<WeightGoal, CorruptRow> {
		const { target_kg, direction } = row;
		if (typeof target_kg !== 'number' || typeof direction !== 'string') {
			return corrupt(CorruptReason.missingColumn);
		}
		const target = Mass.fromKg(target_kg);
		if (!target.ok || !isGoalDirection(direction)) return corrupt(CorruptReason.invalidValue);
		const goal = createWeightGoal({ target: target.value, direction });
		return goal.ok ? goal : corrupt(CorruptReason.brokenInvariant);
	},

	/** @param goal - The goal to store. */
	toRow(goal: WeightGoal): WeightGoalRow {
		return { target_kg: goal.target.kilograms, direction: goal.direction };
	}
};
