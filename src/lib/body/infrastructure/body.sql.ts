import type { SqlStatement } from '../../platform/db/sql.ts';
import type { WeighInRow } from './weigh-in.row.ts';
import type { WeightGoalRow } from './weight-goal.row.ts';

/** Table names, for error messages about corrupt rows. */
export const BodyTable = { weighIn: 'weigh_in', weightGoal: 'weight_goal' } as const;

/** Inserts a weigh-in, or updates the row with the same id. */
export function saveWeighIn(row: WeighInRow): SqlStatement {
	return {
		name: 'save weigh-in',
		sql: `INSERT INTO weigh_in (id, date, weight_kg) VALUES (?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET date = excluded.date, weight_kg = excluded.weight_kg`,
		params: [row.id, row.date, row.weight_kg]
	};
}

/** Finds the weigh-in on one date. */
export function findWeighInByDate(date: string): SqlStatement {
	return {
		name: 'find weigh-in by date',
		sql: 'SELECT id, date, weight_kg FROM weigh_in WHERE date = ?',
		params: [date]
	};
}

/** Lists every weigh-in, newest first. */
export const FIND_ALL_WEIGH_INS: SqlStatement = {
	name: 'find all weigh-ins',
	sql: 'SELECT id, date, weight_kg FROM weigh_in ORDER BY date DESC',
	params: []
};

/** Deletes one weigh-in. */
export function deleteWeighIn(id: string): SqlStatement {
	return { name: 'delete weigh-in', sql: 'DELETE FROM weigh_in WHERE id = ?', params: [id] };
}

/** Reads the active weight goal. */
export const FIND_WEIGHT_GOAL: SqlStatement = {
	name: 'find weight goal',
	sql: 'SELECT target_kg, direction FROM weight_goal WHERE id = 1',
	params: []
};

/** Stores the active weight goal, replacing any earlier one. */
export function saveWeightGoal(row: WeightGoalRow): SqlStatement {
	return {
		name: 'save weight goal',
		sql: 'INSERT OR REPLACE INTO weight_goal (id, target_kg, direction) VALUES (1, ?, ?)',
		params: [row.target_kg, row.direction]
	};
}

/** Removes the active weight goal. */
export const CLEAR_WEIGHT_GOAL: SqlStatement = {
	name: 'clear weight goal',
	sql: 'DELETE FROM weight_goal',
	params: []
};
