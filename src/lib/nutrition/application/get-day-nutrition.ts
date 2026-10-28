import type { LocalDate } from '../../shared/local-date.ts';
import { goalsOn } from '../domain/daily-goals.ts';
import { summarizeDay, type DailyNutritionSummary } from '../domain/daily-nutrition-summary.ts';
import type { FoodLogEntry } from '../domain/food-log-entry.ts';
import type { DailyGoalsReader, FoodLogReader } from '../domain/nutrition-repositories.ts';

/** A day's food log and how it compares with that day's goals. */
export interface DayNutrition {
	readonly entries: readonly FoodLogEntry[];
	readonly summary: DailyNutritionSummary;
}

/** The day to read. */
export interface GetDayNutritionCommand {
	readonly date: LocalDate;
}

/** Reads a day's entries and totals for the Eat and Today tabs. */
export class GetDayNutrition {
	constructor(
		private readonly log: FoodLogReader,
		private readonly goals: DailyGoalsReader
	) {}

	/** @param command - The day. */
	async execute(command: GetDayNutritionCommand): Promise<DayNutrition> {
		const [entries, versions] = await Promise.all([
			this.log.findByDate(command.date),
			this.goals.findAll()
		]);
		return { entries, summary: summarizeDay(entries, goalsOn(versions, command.date)) };
	}
}
