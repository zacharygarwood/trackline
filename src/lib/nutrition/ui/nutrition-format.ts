import { messages } from '../../i18n/messages.en.ts';
import type { Macros } from '../domain/macros.ts';
import { MealSlot } from '../domain/meal-slot.constants.ts';

const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

/** The label of each meal slot. */
export const SLOT_LABELS: Readonly<Record<MealSlot, string>> = {
	[MealSlot.breakfast]: messages.nutrition.breakfast,
	[MealSlot.lunch]: messages.nutrition.lunch,
	[MealSlot.dinner]: messages.nutrition.dinner,
	[MealSlot.snacks]: messages.nutrition.snacks
};

/**
 * Calories as shown in lists, for example "248 kcal".
 *
 * @param calories - Energy in kcal.
 */
export function formatCalories(calories: number): string {
	return messages.nutrition.kcal(whole.format(calories));
}

/**
 * Grams as shown in lists, for example "46.5 g".
 *
 * @param grams - A weight in grams.
 */
export function formatGrams(grams: number): string {
	return messages.nutrition.grams(oneDecimal.format(grams));
}

/**
 * An amount with its unit, for example "150 g" or "2 slice".
 *
 * @param amount - The amount.
 * @param unit - The food's unit.
 */
export function formatAmount(amount: number, unit: string): string {
	return messages.nutrition.amountWithUnit(oneDecimal.format(amount), unit);
}

/**
 * All four macros on one line, for example "248 kcal · P 46.5 g · C 0 g · F 5.4 g".
 *
 * @param macros - The macros.
 */
export function formatMacroLine(macros: Macros): string {
	return messages.nutrition.macroLine({
		calories: whole.format(macros.calories),
		protein: oneDecimal.format(macros.protein),
		carbs: oneDecimal.format(macros.carbs),
		fat: oneDecimal.format(macros.fat)
	});
}

/** The label of each macro. */
export const MACRO_LABELS: Readonly<Record<keyof Macros, string>> = {
	calories: messages.nutrition.calories,
	protein: messages.nutrition.protein,
	carbs: messages.nutrition.carbs,
	fat: messages.nutrition.fat
};

/** The unit each macro is entered in. */
export const MACRO_UNITS: Readonly<Record<keyof Macros, string>> = {
	calories: messages.units.kcal,
	protein: messages.units.grams,
	carbs: messages.units.grams,
	fat: messages.units.grams
};

/**
 * One macro amount for display: calories as kcal, the others in grams.
 *
 * @param key - Which macro.
 * @param amount - Its amount.
 */
export function formatMacro(key: keyof Macros, amount: number): string {
	return key === 'calories' ? formatCalories(amount) : formatGrams(amount);
}
