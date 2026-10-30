import { messages } from '../../i18n/messages.en.ts';
import type { Macros } from '../domain/macros.ts';

const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

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
 * How much of a goal is eaten, for example "1,064 / 2,453 kcal" or "84.1 / 150 g".
 *
 * @param key - Which macro.
 * @param eaten - The amount eaten.
 * @param target - The goal.
 */
export function formatMacroProgress(key: keyof Macros, eaten: number, target: number): string {
	const amount = key === 'calories' ? whole.format(eaten) : oneDecimal.format(eaten);
	return messages.nutrition.ofTarget(amount, formatMacro(key, target));
}

/**
 * A macro amount as a whole number without its unit, for a large number: "1,359" or "84".
 *
 * @param amount - Its amount.
 */
export function formatMacroNumber(amount: number): string {
	return whole.format(amount);
}

/**
 * The goal after a large number, for example "/ 2,200 kcal" or "/ 150 g".
 *
 * @param key - Which macro.
 * @param target - The goal.
 */
export function formatMacroGoal(key: keyof Macros, target: number): string {
	return messages.nutrition.outOf(formatMacro(key, target));
}

/**
 * One macro amount for display: calories as kcal, the others in grams.
 *
 * @param key - Which macro.
 * @param amount - Its amount.
 */
export function formatMacro(key: keyof Macros, amount: number): string {
	return key === 'calories' ? formatCalories(amount) : formatGrams(amount);
}
