import { MealSlot } from './meal-slot.constants.ts';

const LUNCH_FROM_HOUR = 11;
const DINNER_FROM_HOUR = 16;
const SNACKS_FROM_HOUR = 21;

/**
 * The meal slot that usually fits a time of day, used as the default when logging.
 *
 * @param hour - The local hour, 0–23.
 */
export function mealSlotAt(hour: number): MealSlot {
	if (hour < LUNCH_FROM_HOUR) return MealSlot.breakfast;
	if (hour < DINNER_FROM_HOUR) return MealSlot.lunch;
	return hour < SNACKS_FROM_HOUR ? MealSlot.dinner : MealSlot.snacks;
}
