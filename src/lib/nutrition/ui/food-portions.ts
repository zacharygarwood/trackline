import { messages } from '../../i18n/messages.en.ts';
import { FoodUnit } from '../../shared/food-unit.constants.ts';
import type { Portion } from '../domain/portion.ts';

const HUNDREDTHS = 100;
const upToTwoDecimals = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

/** How much one tap of − or + changes an amount, per unit; other units step by one. */
const STEPS: Readonly<Record<string, number>> = {
	[FoodUnit.g]: 10,
	[FoodUnit.oz]: 0.5,
	[FoodUnit.cup]: 0.25,
	[FoodUnit.serving]: 0.5,
	[FoodUnit.piece]: 1
};

/** Units counted in whole items, shown as "×2" rather than "2 serving". */
const COUNTED: readonly string[] = [FoodUnit.serving, FoodUnit.piece];

/**
 * A plain amount without trailing zeros, for example "1.5" or "100".
 *
 * @param amount - The amount.
 */
export function amountText(amount: number): string {
	return upToTwoDecimals.format(amount);
}

/**
 * How much one stepper tap changes an amount of a unit.
 *
 * @param unit - The food's unit.
 */
export function stepFor(unit: string): number {
	return STEPS[unit] ?? 1;
}

/**
 * An amount moved one step up or down, never below one step.
 *
 * @param amount - The current amount.
 * @param unit - The food's unit.
 * @param direction - 1 for up, -1 for down.
 */
export function stepAmount(amount: number, unit: string, direction: number): number {
	const step = stepFor(unit);
	return Math.max(step, Math.round((amount + direction * step) * HUNDREDTHS) / HUNDREDTHS);
}

/**
 * A unit's name for an amount: "serving" or "servings", "cup" or "cups", else the unit itself.
 *
 * @param unit - The food's unit.
 * @param amount - The amount.
 */
export function unitName(unit: string, amount: number): string {
	const names = messages.food.unitNames;
	const forms =
		unit === FoodUnit.serving || unit === FoodUnit.piece || unit === FoodUnit.cup
			? names[unit]
			: undefined;
	if (forms === undefined) return unit;
	return amount === 1 ? forms.one : forms.many;
}

/**
 * How a logged amount is shown in a list: "×2" or nothing for one serving or piece, else "150 g".
 *
 * @param amount - The amount.
 * @param unit - The food's unit.
 */
export function amountLabel(amount: number, unit: string): string {
	if (COUNTED.includes(unit)) return amount === 1 ? '' : messages.food.times(amountText(amount));
	return messages.nutrition.amountWithUnit(amountText(amount), unitName(unit, amount));
}

/**
 * A food's reference portion beside its name: nothing for servings and pieces, else "100 g".
 *
 * @param reference - The portion its macros are for.
 */
export function baseLabel(reference: Portion): string {
	return COUNTED.includes(reference.unit)
		? ''
		: messages.nutrition.amountWithUnit(amountText(reference.amount), reference.unit);
}
