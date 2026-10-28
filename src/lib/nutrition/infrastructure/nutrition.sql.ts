import type { SqlStatement } from '../../platform/db/sql.ts';
import type {
	DailyGoalsRow,
	FoodLogEntryRow,
	FoodRow,
	SavedMealItemRow,
	SavedMealRow
} from './nutrition.row.ts';

/** Table names, for error messages about corrupt rows. */
export const NutritionTable = {
	food: 'food',
	savedMeal: 'saved_meal',
	foodLogEntry: 'food_log_entry',
	dailyGoals: 'daily_goals'
} as const;

const FOOD_COLUMNS =
	'id, name, reference_amount, reference_unit, calories, protein_g, carbs_g, fat_g';
const ENTRY_COLUMNS =
	'id, date, slot, food_id, food_name, unit, amount, calories, protein_g, carbs_g, fat_g, logged_at';

/** Lists foods, most recently logged first, then the rest by name. */
export const FIND_ALL_FOODS: SqlStatement = {
	name: 'find all foods',
	sql: `SELECT ${FOOD_COLUMNS} FROM food
		LEFT JOIN (SELECT food_id, max(logged_at) AS last_logged FROM food_log_entry GROUP BY food_id)
		ON food_id = id
		ORDER BY last_logged IS NULL, last_logged DESC, name COLLATE NOCASE`,
	params: []
};

/** Finds a food by id. */
export function findFoodById(id: string): SqlStatement {
	return { name: 'find food', sql: `SELECT ${FOOD_COLUMNS} FROM food WHERE id = ?`, params: [id] };
}

/** Inserts or updates a food. */
export function saveFood(row: FoodRow): SqlStatement {
	return {
		name: 'save food',
		sql: `INSERT OR REPLACE INTO food (${FOOD_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		params: [
			row.id,
			row.name,
			row.reference_amount,
			row.reference_unit,
			row.calories,
			row.protein_g,
			row.carbs_g,
			row.fat_g
		]
	};
}

/** Lists saved meals by name. */
export const FIND_ALL_MEALS: SqlStatement = {
	name: 'find all saved meals',
	sql: 'SELECT id, name FROM saved_meal ORDER BY name COLLATE NOCASE',
	params: []
};

/** Finds a saved meal by id. */
export function findMealById(id: string): SqlStatement {
	return {
		name: 'find saved meal',
		sql: 'SELECT id, name FROM saved_meal WHERE id = ?',
		params: [id]
	};
}

/** Lists a saved meal's items in order. */
export function findMealItems(mealId: string): SqlStatement {
	return {
		name: 'find saved meal items',
		sql: 'SELECT meal_id, position, food_id, amount FROM saved_meal_item WHERE meal_id = ? ORDER BY position',
		params: [mealId]
	};
}

/** Inserts or renames a saved meal. */
export function upsertMeal(row: SavedMealRow): SqlStatement {
	return {
		name: 'save saved meal',
		sql: 'INSERT INTO saved_meal (id, name) VALUES (?, ?) ON CONFLICT (id) DO UPDATE SET name = excluded.name',
		params: [row.id, row.name]
	};
}

/** Removes a saved meal's items before they are rewritten. */
export function clearMealItems(mealId: string): SqlStatement {
	return {
		name: 'clear saved meal items',
		sql: 'DELETE FROM saved_meal_item WHERE meal_id = ?',
		params: [mealId]
	};
}

/** Inserts one item of a saved meal. */
export function insertMealItem(row: SavedMealItemRow): SqlStatement {
	return {
		name: 'insert saved meal item',
		sql: 'INSERT INTO saved_meal_item (meal_id, position, food_id, amount) VALUES (?, ?, ?, ?)',
		params: [row.meal_id, row.position, row.food_id, row.amount]
	};
}

/** Deletes a saved meal and, by cascade, its items. */
export function deleteMeal(id: string): SqlStatement {
	return { name: 'delete saved meal', sql: 'DELETE FROM saved_meal WHERE id = ?', params: [id] };
}

/** Lists a day's log entries in logging order. */
export function findEntriesByDate(date: string): SqlStatement {
	return {
		name: 'find log entries by date',
		sql: `SELECT ${ENTRY_COLUMNS} FROM food_log_entry WHERE date = ? ORDER BY logged_at`,
		params: [date]
	};
}

/** Finds a log entry by id. */
export function findEntryById(id: string): SqlStatement {
	return {
		name: 'find log entry',
		sql: `SELECT ${ENTRY_COLUMNS} FROM food_log_entry WHERE id = ?`,
		params: [id]
	};
}

/** Finds the most recent log entry for a food. */
export function findLastEntryFor(foodId: string): SqlStatement {
	return {
		name: 'find last log entry for food',
		sql: `SELECT ${ENTRY_COLUMNS} FROM food_log_entry WHERE food_id = ? ORDER BY logged_at DESC LIMIT 1`,
		params: [foodId]
	};
}

/** Inserts or replaces a log entry. */
export function saveEntry(row: FoodLogEntryRow): SqlStatement {
	return {
		name: 'save log entry',
		sql: `INSERT OR REPLACE INTO food_log_entry (${ENTRY_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		params: [
			row.id,
			row.date,
			row.slot,
			row.food_id,
			row.food_name,
			row.unit,
			row.amount,
			row.calories,
			row.protein_g,
			row.carbs_g,
			row.fat_g,
			row.logged_at
		]
	};
}

/** Deletes a log entry. */
export function deleteEntry(id: string): SqlStatement {
	return { name: 'delete log entry', sql: 'DELETE FROM food_log_entry WHERE id = ?', params: [id] };
}

/** Lists every goals version. */
export const FIND_ALL_GOALS: SqlStatement = {
	name: 'find daily goals',
	sql: 'SELECT effective_from, calories, protein_g, carbs_g, fat_g FROM daily_goals',
	params: []
};

/** Stores a goals version, replacing one with the same start date. */
export function saveGoals(row: DailyGoalsRow): SqlStatement {
	return {
		name: 'save daily goals',
		sql: 'INSERT OR REPLACE INTO daily_goals (effective_from, calories, protein_g, carbs_g, fat_g) VALUES (?, ?, ?, ?, ?)',
		params: [row.effective_from, row.calories, row.protein_g, row.carbs_g, row.fat_g]
	};
}
