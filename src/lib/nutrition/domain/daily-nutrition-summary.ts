import type { DailyGoals } from './daily-goals.ts';
import type { FoodLogEntry } from './food-log-entry.ts';
import { addMacros, NO_MACROS, remainingMacros, type Macros } from './macros.ts';

/** A day's totals, compared with the goals in effect that day. */
export interface DailyNutritionSummary {
	readonly eaten: Macros;
	/** The targets, if goals were set by then. */
	readonly targets: Macros | undefined;
	/** Targets minus eaten; negative means over. Undefined without goals. */
	readonly remaining: Macros | undefined;
}

/**
 * Totals a day's entries and compares them with that day's goals.
 *
 * @param entries - The day's log entries.
 * @param goals - The goals in effect that day, if any.
 */
export function summarizeDay(
	entries: readonly FoodLogEntry[],
	goals: DailyGoals | undefined
): DailyNutritionSummary {
	const eaten = entries.reduce((total, entry) => addMacros(total, entry.macrosSnapshot), NO_MACROS);
	return {
		eaten,
		targets: goals?.targets,
		remaining: goals === undefined ? undefined : remainingMacros(goals.targets, eaten)
	};
}
