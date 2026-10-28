import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { macrosForAmount, type Food } from './food.ts';
import type { FoodId, FoodLogEntryId } from './ids.ts';
import type { Macros } from './macros.ts';
import { scaleMacros } from './macros.ts';
import type { MealSlot } from './meal-slot.constants.ts';
import { InvalidAmount, isAmount } from './portion.ts';

/**
 * Something eaten on a day. The food's name, unit, and macros are copied
 * when it is logged, so editing the food later never changes past days.
 */
export interface FoodLogEntry {
	readonly id: FoodLogEntryId;
	readonly date: LocalDate;
	readonly slot: MealSlot;
	readonly foodId: FoodId;
	readonly foodNameSnapshot: string;
	readonly unitSnapshot: string;
	readonly amount: number;
	readonly macrosSnapshot: Macros;
	/** When it was logged, in epoch milliseconds. */
	readonly loggedAt: number;
}

/** Where and when a food is being logged. */
export interface LogPlacement {
	readonly id: FoodLogEntryId;
	readonly date: LocalDate;
	readonly slot: MealSlot;
	readonly loggedAt: number;
}

/**
 * Logs an amount of a food, computing its macros once.
 *
 * @param food - The food eaten.
 * @param amount - How much, in the food's reference unit.
 * @param placement - The entry's id, day, meal slot, and time.
 */
export function logFood(
	food: Food,
	amount: number,
	placement: LogPlacement
): Result<FoodLogEntry, InvalidAmount> {
	const macros = macrosForAmount(food, amount);
	if (!macros.ok) return macros;
	return ok({
		...placement,
		foodId: food.id,
		foodNameSnapshot: food.name,
		unitSnapshot: food.reference.unit,
		amount,
		macrosSnapshot: macros.value
	});
}

/**
 * Changes how much was eaten, scaling the snapshot so the food itself is not consulted.
 *
 * @param entry - The logged entry.
 * @param amount - The corrected amount.
 */
export function changeAmount(
	entry: FoodLogEntry,
	amount: number
): Result<FoodLogEntry, InvalidAmount> {
	if (!isAmount(amount)) return err(new InvalidAmount(amount));
	return ok({
		...entry,
		amount,
		macrosSnapshot: scaleMacros(entry.macrosSnapshot, amount / entry.amount)
	});
}
