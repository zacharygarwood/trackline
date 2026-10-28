import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { DailyGoals } from '../domain/daily-goals.ts';
import type { FoodLogEntry } from '../domain/food-log-entry.ts';
import type { Food } from '../domain/food.ts';
import type { FoodId, FoodLogEntryId, SavedMealId } from '../domain/ids.ts';
import type {
	DailyGoalsReader,
	DailyGoalsWriter,
	FoodLogReader,
	FoodLogWriter,
	FoodReader,
	FoodWriter,
	SavedMealReader,
	SavedMealWriter
} from '../domain/nutrition-repositories.ts';
import type { SavedMeal } from '../domain/saved-meal.ts';
import {
	dailyGoalsMapper,
	foodLogEntryMapper,
	foodMapper,
	savedMealMapper
} from './nutrition.mapper.ts';
import {
	clearMealItems,
	deleteEntry,
	deleteMeal,
	FIND_ALL_FOODS,
	FIND_ALL_GOALS,
	FIND_ALL_MEALS,
	findEntriesByDate,
	findEntryById,
	findFoodById,
	findLastEntryFor,
	findMealById,
	findMealItems,
	insertMealItem,
	saveEntry,
	saveFood,
	saveGoals,
	upsertMeal
} from './nutrition.sql.ts';

/** The food library in the `food` table. */
export class SqliteFoodRepository implements FoodReader, FoodWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc FoodReader.findAll} */
	async findAll(): Promise<readonly Food[]> {
		const rows = await this.database.query(FIND_ALL_FOODS);
		return rows.map((row) => requireValidRow(foodMapper.toDomain(row)));
	}

	/** {@inheritDoc FoodReader.findById} */
	async findById(id: FoodId): Promise<Food | undefined> {
		const row = first(await this.database.query(findFoodById(id)));
		return row === undefined ? undefined : requireValidRow(foodMapper.toDomain(row));
	}

	/** {@inheritDoc FoodWriter.save} */
	async save(food: Food): Promise<void> {
		await this.database.execute(saveFood(foodMapper.toRow(food)));
	}
}

/** Saved meals in the `saved_meal` and `saved_meal_item` tables. */
export class SqliteSavedMealRepository implements SavedMealReader, SavedMealWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc SavedMealReader.findAll} */
	async findAll(): Promise<readonly SavedMeal[]> {
		const rows = await this.database.query(FIND_ALL_MEALS);
		return Promise.all(rows.map((row) => this.load(row)));
	}

	/** {@inheritDoc SavedMealReader.findById} */
	async findById(id: SavedMealId): Promise<SavedMeal | undefined> {
		const row = first(await this.database.query(findMealById(id)));
		return row === undefined ? undefined : this.load(row);
	}

	/** {@inheritDoc SavedMealWriter.save} */
	async save(meal: SavedMeal): Promise<void> {
		const rows = savedMealMapper.toRows(meal);
		await this.database.transaction([
			upsertMeal(rows.meal),
			clearMealItems(meal.id),
			...rows.items.map(insertMealItem)
		]);
	}

	/** {@inheritDoc SavedMealWriter.delete} */
	async delete(id: SavedMealId): Promise<void> {
		await this.database.execute(deleteMeal(id));
	}

	private async load(row: SqlRow): Promise<SavedMeal> {
		const items = await this.database.query(
			findMealItems(typeof row.id === 'string' ? row.id : '')
		);
		return requireValidRow(savedMealMapper.toDomain(row, items));
	}
}

/** The food log in the `food_log_entry` table. */
export class SqliteFoodLogRepository implements FoodLogReader, FoodLogWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc FoodLogReader.findByDate} */
	async findByDate(date: LocalDate): Promise<readonly FoodLogEntry[]> {
		const rows = await this.database.query(findEntriesByDate(date.toString()));
		return rows.map((row) => requireValidRow(foodLogEntryMapper.toDomain(row)));
	}

	/** {@inheritDoc FoodLogReader.findById} */
	async findById(id: FoodLogEntryId): Promise<FoodLogEntry | undefined> {
		return this.single(await this.database.query(findEntryById(id)));
	}

	/** {@inheritDoc FoodLogReader.findLastFor} */
	async findLastFor(foodId: FoodId): Promise<FoodLogEntry | undefined> {
		return this.single(await this.database.query(findLastEntryFor(foodId)));
	}

	/** {@inheritDoc FoodLogWriter.save} */
	async save(entries: readonly FoodLogEntry[]): Promise<void> {
		await this.database.transaction(
			entries.map((entry) => saveEntry(foodLogEntryMapper.toRow(entry)))
		);
	}

	/** {@inheritDoc FoodLogWriter.delete} */
	async delete(id: FoodLogEntryId): Promise<void> {
		await this.database.execute(deleteEntry(id));
	}

	private single(rows: readonly SqlRow[]): FoodLogEntry | undefined {
		const row = first(rows);
		return row === undefined ? undefined : requireValidRow(foodLogEntryMapper.toDomain(row));
	}
}

/** Daily goals versions in the `daily_goals` table. */
export class SqliteDailyGoalsRepository implements DailyGoalsReader, DailyGoalsWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc DailyGoalsReader.findAll} */
	async findAll(): Promise<readonly DailyGoals[]> {
		const rows = await this.database.query(FIND_ALL_GOALS);
		return rows.map((row) => requireValidRow(dailyGoalsMapper.toDomain(row)));
	}

	/** {@inheritDoc DailyGoalsWriter.save} */
	async save(goals: DailyGoals): Promise<void> {
		await this.database.execute(saveGoals(dailyGoalsMapper.toRow(goals)));
	}
}
