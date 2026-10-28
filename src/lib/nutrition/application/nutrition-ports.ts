import type { Clock } from '../../shared/clock.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
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

/** Reads and writes the food library. */
export type Foods = FoodReader & FoodWriter;

/** Reads and writes saved meals. */
export type SavedMeals = SavedMealReader & SavedMealWriter;

/** Reads and writes the food log. */
export type FoodLog = FoodLogReader & FoodLogWriter;

/** Reads and writes daily goals versions. */
export type Goals = DailyGoalsReader & DailyGoalsWriter;

/** Time and identity sources for new nutrition records. */
export interface Creation {
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

/** Raised when a food or saved meal no longer exists. */
export class NotFound {
	/** @param id - The id that was looked up. */
	constructor(readonly id: string) {}
}
