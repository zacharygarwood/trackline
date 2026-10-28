import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { createDailyGoals, type DailyGoals } from '../domain/daily-goals.ts';
import type { FoodLogEntry } from '../domain/food-log-entry.ts';
import { createFood, type Food } from '../domain/food.ts';
import { createMacros, type Macros } from '../domain/macros.ts';
import { MealSlot } from '../domain/meal-slot.constants.ts';
import { createSavedMeal, type SavedMeal, type SavedMealItem } from '../domain/saved-meal.ts';
import type {
	DailyGoalsRow,
	FoodLogEntryRow,
	FoodRow,
	SavedMealItemRow,
	SavedMealRow
} from './nutrition.row.ts';
import { NutritionTable } from './nutrition.sql.ts';

const corrupt = (table: string) => err(new CorruptRow(table, CorruptReason.invalidValue));

function macrosOf(row: SqlRow): Macros | undefined {
	const { calories, protein_g, carbs_g, fat_g } = row;
	if (typeof calories !== 'number' || typeof protein_g !== 'number') return undefined;
	if (typeof carbs_g !== 'number' || typeof fat_g !== 'number') return undefined;
	const macros = createMacros({ calories, protein: protein_g, carbs: carbs_g, fat: fat_g });
	return macros.ok ? macros.value : undefined;
}

const macroColumns = (macros: Macros) => ({
	calories: macros.calories,
	protein_g: macros.protein,
	carbs_g: macros.carbs,
	fat_g: macros.fat
});

const isMealSlot = (value: unknown): value is MealSlot =>
	Object.values<unknown>(MealSlot).includes(value);

function foodFields(row: SqlRow): Food | undefined {
	const { id, name, reference_amount, reference_unit } = row;
	const foodId = typeof id === 'string' ? parseId<'Food'>(id) : undefined;
	const macros = macrosOf(row);
	if (foodId?.ok !== true || macros === undefined || typeof name !== 'string') return undefined;
	if (typeof reference_amount !== 'number' || typeof reference_unit !== 'string') return undefined;
	return {
		id: foodId.value,
		name,
		reference: { amount: reference_amount, unit: reference_unit },
		macrosPerReference: macros
	};
}

/** Converts between foods and `food` rows. */
export const foodMapper = {
	/** @param row - A row with the columns of {@link FoodRow}. */
	toDomain(row: SqlRow): Result<Food, CorruptRow> {
		const fields = foodFields(row);
		const food = fields === undefined ? undefined : createFood(fields);
		return food?.ok === true ? food : corrupt(NutritionTable.food);
	},

	/** @param food - The food to store. */
	toRow(food: Food): FoodRow {
		return {
			id: food.id,
			name: food.name,
			reference_amount: food.reference.amount,
			reference_unit: food.reference.unit,
			...macroColumns(food.macrosPerReference)
		};
	}
};

function mealItem(row: SqlRow): SavedMealItem | undefined {
	const { food_id, amount } = row;
	const foodId = typeof food_id === 'string' ? parseId<'Food'>(food_id) : undefined;
	return foodId?.ok === true && typeof amount === 'number'
		? { foodId: foodId.value, amount }
		: undefined;
}

/** Converts between saved meals and `saved_meal` and `saved_meal_item` rows. */
export const savedMealMapper = {
	/**
	 * @param meal - The meal's row.
	 * @param items - Its item rows, in order.
	 */
	toDomain(meal: SqlRow, items: readonly SqlRow[]): Result<SavedMeal, CorruptRow> {
		const { id, name } = meal;
		const mealId = typeof id === 'string' ? parseId<'SavedMeal'>(id) : undefined;
		const parsed = items.map(mealItem);
		if (mealId?.ok !== true || typeof name !== 'string' || parsed.includes(undefined)) {
			return corrupt(NutritionTable.savedMeal);
		}
		const created = createSavedMeal({
			id: mealId.value,
			name,
			items: parsed.filter((item) => item !== undefined)
		});
		return created.ok ? created : corrupt(NutritionTable.savedMeal);
	},

	/** @param meal - The meal to store. */
	toRows(meal: SavedMeal): {
		readonly meal: SavedMealRow;
		readonly items: readonly SavedMealItemRow[];
	} {
		return {
			meal: { id: meal.id, name: meal.name },
			items: meal.items.map((item, position) => ({
				meal_id: meal.id,
				position,
				food_id: item.foodId,
				amount: item.amount
			}))
		};
	}
};

function entryText(
	row: SqlRow
):
	| Omit<FoodLogEntryRow, 'amount' | 'logged_at' | keyof ReturnType<typeof macroColumns>>
	| undefined {
	const { id, date, slot, food_id, food_name, unit } = row;
	if (typeof id !== 'string' || typeof date !== 'string' || typeof slot !== 'string')
		return undefined;
	if (typeof food_id !== 'string' || typeof food_name !== 'string' || typeof unit !== 'string')
		return undefined;
	return { id, date, slot, food_id, food_name, unit };
}

function entryIdentity(
	text: NonNullable<ReturnType<typeof entryText>>
): Pick<FoodLogEntry, 'id' | 'date' | 'slot' | 'foodId'> | undefined {
	const id = parseId<'FoodLogEntry'>(text.id);
	const foodId = parseId<'Food'>(text.food_id);
	const date = LocalDate.parse(text.date);
	if (!id.ok || !foodId.ok || !date.ok || !isMealSlot(text.slot)) return undefined;
	return { id: id.value, date: date.value, slot: text.slot, foodId: foodId.value };
}

function entryOf(row: SqlRow): FoodLogEntry | undefined {
	const text = entryText(row);
	const identity = text === undefined ? undefined : entryIdentity(text);
	const macrosSnapshot = macrosOf(row);
	const { amount, logged_at } = row;
	if (text === undefined || identity === undefined || macrosSnapshot === undefined)
		return undefined;
	if (typeof amount !== 'number' || typeof logged_at !== 'number') return undefined;
	return {
		...identity,
		foodNameSnapshot: text.food_name,
		unitSnapshot: text.unit,
		amount,
		macrosSnapshot,
		loggedAt: logged_at
	};
}

/** Converts between food log entries and `food_log_entry` rows. */
export const foodLogEntryMapper = {
	/** @param row - A row with the columns of {@link FoodLogEntryRow}. */
	toDomain(row: SqlRow): Result<FoodLogEntry, CorruptRow> {
		const entry = entryOf(row);
		return entry === undefined ? corrupt(NutritionTable.foodLogEntry) : ok(entry);
	},

	/** @param entry - The entry to store. */
	toRow(entry: FoodLogEntry): FoodLogEntryRow {
		return {
			id: entry.id,
			date: entry.date.toString(),
			slot: entry.slot,
			food_id: entry.foodId,
			food_name: entry.foodNameSnapshot,
			unit: entry.unitSnapshot,
			amount: entry.amount,
			...macroColumns(entry.macrosSnapshot),
			logged_at: entry.loggedAt
		};
	}
};

/** Converts between daily goals versions and `daily_goals` rows. */
export const dailyGoalsMapper = {
	/** @param row - A row with the columns of {@link DailyGoalsRow}. */
	toDomain(row: SqlRow): Result<DailyGoals, CorruptRow> {
		const { effective_from } = row;
		const date = typeof effective_from === 'string' ? LocalDate.parse(effective_from) : undefined;
		const targets = macrosOf(row);
		if (date?.ok !== true || targets === undefined) return corrupt(NutritionTable.dailyGoals);
		const goals = createDailyGoals({ targets, effectiveFrom: date.value });
		return goals.ok ? goals : corrupt(NutritionTable.dailyGoals);
	},

	/** @param goals - The version to store. */
	toRow(goals: DailyGoals): DailyGoalsRow {
		return { effective_from: goals.effectiveFrom.toString(), ...macroColumns(goals.targets) };
	}
};
