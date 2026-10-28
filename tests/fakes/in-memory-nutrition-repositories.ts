import type { DailyGoals } from '../../src/lib/nutrition/domain/daily-goals.ts';
import type { FoodLogEntry } from '../../src/lib/nutrition/domain/food-log-entry.ts';
import type { Food } from '../../src/lib/nutrition/domain/food.ts';
import type { FoodId, FoodLogEntryId, SavedMealId } from '../../src/lib/nutrition/domain/ids.ts';
import type {
	DailyGoalsReader,
	DailyGoalsWriter,
	FoodLogReader,
	FoodLogWriter,
	FoodReader,
	FoodWriter,
	SavedMealReader,
	SavedMealWriter
} from '../../src/lib/nutrition/domain/nutrition-repositories.ts';
import type { SavedMeal } from '../../src/lib/nutrition/domain/saved-meal.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/** The food log in memory. */
export class InMemoryFoodLog implements FoodLogReader, FoodLogWriter {
	readonly entries = new Map<FoodLogEntryId, FoodLogEntry>();

	findByDate(date: LocalDate): Promise<readonly FoodLogEntry[]> {
		return Promise.resolve(
			[...this.entries.values()]
				.filter((entry) => entry.date.equals(date))
				.toSorted((a, b) => a.loggedAt - b.loggedAt)
		);
	}

	findById(id: FoodLogEntryId): Promise<FoodLogEntry | undefined> {
		return Promise.resolve(this.entries.get(id));
	}

	findLastFor(foodId: FoodId): Promise<FoodLogEntry | undefined> {
		return Promise.resolve(
			[...this.entries.values()]
				.filter((entry) => entry.foodId === foodId)
				.toSorted((a, b) => b.loggedAt - a.loggedAt)
				.at(0)
		);
	}

	save(entries: readonly FoodLogEntry[]): Promise<void> {
		entries.forEach((entry) => this.entries.set(entry.id, entry));
		return Promise.resolve();
	}

	delete(id: FoodLogEntryId): Promise<void> {
		this.entries.delete(id);
		return Promise.resolve();
	}
}

/** The food library in memory; sorts by the food log's recency like the SQL query. */
export class InMemoryFoods implements FoodReader, FoodWriter {
	private readonly foods = new Map<FoodId, Food>();

	constructor(private readonly log: InMemoryFoodLog) {}

	findAll(): Promise<readonly Food[]> {
		const lastLogged = (food: Food) =>
			Math.max(
				-1,
				...[...this.log.entries.values()]
					.filter((entry) => entry.foodId === food.id)
					.map((entry) => entry.loggedAt)
			);
		return Promise.resolve(
			[...this.foods.values()].toSorted((a, b) => {
				const byRecency = lastLogged(b) - lastLogged(a);
				return byRecency === 0 ? a.name.localeCompare(b.name) : byRecency;
			})
		);
	}

	findById(id: FoodId): Promise<Food | undefined> {
		return Promise.resolve(this.foods.get(id));
	}

	save(food: Food): Promise<void> {
		this.foods.set(food.id, food);
		return Promise.resolve();
	}
}

/** Saved meals in memory. */
export class InMemorySavedMeals implements SavedMealReader, SavedMealWriter {
	private readonly meals = new Map<SavedMealId, SavedMeal>();

	findAll(): Promise<readonly SavedMeal[]> {
		return Promise.resolve(
			[...this.meals.values()].toSorted((a, b) => a.name.localeCompare(b.name))
		);
	}

	findById(id: SavedMealId): Promise<SavedMeal | undefined> {
		return Promise.resolve(this.meals.get(id));
	}

	save(meal: SavedMeal): Promise<void> {
		this.meals.set(meal.id, meal);
		return Promise.resolve();
	}

	delete(id: SavedMealId): Promise<void> {
		this.meals.delete(id);
		return Promise.resolve();
	}
}

/** Daily goals versions in memory, one per start date. */
export class InMemoryDailyGoals implements DailyGoalsReader, DailyGoalsWriter {
	private readonly versions = new Map<string, DailyGoals>();

	findAll(): Promise<readonly DailyGoals[]> {
		return Promise.resolve([...this.versions.values()]);
	}

	save(goals: DailyGoals): Promise<void> {
		this.versions.set(goals.effectiveFrom.toString(), goals);
		return Promise.resolve();
	}
}
