import { err, ok, type Result } from '../../shared/result.ts';

/** Energy and macronutrients: calories in kcal, protein, carbs, and fat in grams. */
export interface Macros {
	readonly calories: number;
	readonly protein: number;
	readonly carbs: number;
	readonly fat: number;
}

/** Nothing eaten yet. */
export const NO_MACROS: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/** Raised when a macro value is negative or not a number. */
export class InvalidMacros {
	/** @param macros - The rejected values. */
	constructor(readonly macros: Macros) {}
}

const isAmount = (value: number) => Number.isFinite(value) && value >= 0;

/**
 * Creates macros, rejecting negative or non-numeric values.
 *
 * @param macros - Calories and grams of protein, carbs, and fat.
 */
export function createMacros(macros: Macros): Result<Macros, InvalidMacros> {
	const { calories, protein, carbs, fat } = macros;
	return [calories, protein, carbs, fat].every(isAmount)
		? ok({ calories, protein, carbs, fat })
		: err(new InvalidMacros(macros));
}

/**
 * Adds two sets of macros.
 *
 * @param a - The first amounts.
 * @param b - The amounts to add.
 */
export function addMacros(a: Macros, b: Macros): Macros {
	return {
		calories: a.calories + b.calories,
		protein: a.protein + b.protein,
		carbs: a.carbs + b.carbs,
		fat: a.fat + b.fat
	};
}

/**
 * Multiplies every macro by the same factor.
 *
 * @param macros - The amounts.
 * @param factor - A non-negative multiplier, for example 1.5 for one and a half portions.
 */
export function scaleMacros(macros: Macros, factor: number): Macros {
	return {
		calories: macros.calories * factor,
		protein: macros.protein * factor,
		carbs: macros.carbs * factor,
		fat: macros.fat * factor
	};
}

/**
 * Subtracts eaten macros from a target; negative results mean over the target.
 *
 * @param target - The goal.
 * @param eaten - What was eaten.
 */
export function remainingMacros(target: Macros, eaten: Macros): Macros {
	return {
		calories: target.calories - eaten.calories,
		protein: target.protein - eaten.protein,
		carbs: target.carbs - eaten.carbs,
		fat: target.fat - eaten.fat
	};
}
