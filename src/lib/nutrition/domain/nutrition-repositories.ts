import type { LocalDate } from '../../shared/local-date.ts';
import type { DailyGoals } from './daily-goals.ts';
import type { FoodLogEntry } from './food-log-entry.ts';
import type { Food } from './food.ts';
import type { FoodId, FoodLogEntryId, SavedMealId } from './ids.ts';
import type { SavedMeal } from './saved-meal.ts';

/** Reads the food library. */
export interface FoodReader {
	/** Every food: the most recently logged first, then never-logged foods by name. */
	findAll(): Promise<readonly Food[]>;
	/** A food by id. */
	findById(id: FoodId): Promise<Food | undefined>;
}

/** Adds foods to the library. */
export interface FoodWriter {
	/** Stores a food, replacing an earlier version with the same id. */
	save(food: Food): Promise<void>;
}

/** Reads saved meals. */
export interface SavedMealReader {
	/** Every saved meal, by name. */
	findAll(): Promise<readonly SavedMeal[]>;
	/** A saved meal by id. */
	findById(id: SavedMealId): Promise<SavedMeal | undefined>;
}

/** Stores and removes saved meals. */
export interface SavedMealWriter {
	/** Stores a saved meal. */
	save(meal: SavedMeal): Promise<void>;
	/** Removes a saved meal; logged entries are unaffected. */
	delete(id: SavedMealId): Promise<void>;
}

/** Reads the food log. */
export interface FoodLogReader {
	/** A day's entries, in the order they were logged. */
	findByDate(date: LocalDate): Promise<readonly FoodLogEntry[]>;
	/** An entry by id. */
	findById(id: FoodLogEntryId): Promise<FoodLogEntry | undefined>;
	/** The most recent entry for a food, for pre-filling its amount. */
	findLastFor(foodId: FoodId): Promise<FoodLogEntry | undefined>;
}

/** Stores and removes food log entries. */
export interface FoodLogWriter {
	/** Stores entries in one go, replacing earlier versions with the same ids. */
	save(entries: readonly FoodLogEntry[]): Promise<void>;
	/** Removes an entry. */
	delete(id: FoodLogEntryId): Promise<void>;
}

/** Reads daily goals versions. */
export interface DailyGoalsReader {
	/** Every version, in any order. */
	findAll(): Promise<readonly DailyGoals[]>;
}

/** Stores daily goals versions. */
export interface DailyGoalsWriter {
	/** Stores a version, replacing one that starts on the same date. */
	save(goals: DailyGoals): Promise<void>;
}
