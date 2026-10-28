import { err, ok, type Result } from '../../shared/result.ts';
import type { FoodId } from './ids.ts';
import { createMacros, scaleMacros, type InvalidMacros, type Macros } from './macros.ts';
import { parseName, type InvalidName } from './name.ts';
import {
	createPortion,
	InvalidAmount,
	isAmount,
	type InvalidUnit,
	type Portion
} from './portion.ts';

/** A food the user can log: its macros for a reference portion, such as per 100 g or per slice. */
export interface Food {
	readonly id: FoodId;
	readonly name: string;
	readonly reference: Portion;
	readonly macrosPerReference: Macros;
}

/** Why a food is invalid. */
export type FoodProblem = InvalidName | InvalidAmount | InvalidUnit | InvalidMacros;

/**
 * Creates a food, checking its name, reference portion, and macros.
 *
 * @param fields - The food as entered.
 */
export function createFood(fields: Food): Result<Food, FoodProblem> {
	const name = parseName(fields.name);
	if (!name.ok) return name;
	const reference = createPortion(fields.reference);
	if (!reference.ok) return reference;
	const macros = createMacros(fields.macrosPerReference);
	if (!macros.ok) return macros;
	return ok({
		id: fields.id,
		name: name.value,
		reference: reference.value,
		macrosPerReference: macros.value
	});
}

/**
 * Macros scaled to a logged amount of a food.
 *
 * Scaling is linear: logging 150 g of a food defined per 100 g multiplies
 * every macro by 1.5.
 *
 * @param food - The food whose reference portion defines the macros.
 * @param amount - The amount eaten, in the food's reference unit.
 * @returns The scaled macros, or an error if the amount is not positive.
 */
export function macrosForAmount(food: Food, amount: number): Result<Macros, InvalidAmount> {
	if (!isAmount(amount)) return err(new InvalidAmount(amount));
	return ok(scaleMacros(food.macrosPerReference, amount / food.reference.amount));
}
