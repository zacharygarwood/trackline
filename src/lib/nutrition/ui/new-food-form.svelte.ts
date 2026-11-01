import { FoodUnit } from '../../shared/food-unit.constants.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { CreateFoodCommand } from '../application/create-food.ts';
import type { Food } from '../domain/food.ts';
import { amountText } from './food-portions.ts';

const CALORIES_PER_GRAM_PROTEIN = 4;
const CALORIES_PER_GRAM_CARBS = 4;
const CALORIES_PER_GRAM_FAT = 9;
/** The reference amount of a food measured in grams when none is typed. */
const DEFAULT_GRAMS = 100;

const defaultAmount = (unit: string) => (unit === FoodUnit.g ? DEFAULT_GRAMS : 1);

const grams = (text: string) => Math.max(0, Math.round(parseDecimal(text) ?? 0));

/**
 * Calories from macros: 4 per gram of protein and carbs, 9 per gram of fat.
 *
 * @param macros - Grams of each, as typed.
 * @param macros.protein - Protein.
 * @param macros.carbs - Carbs.
 * @param macros.fat - Fat.
 */
export function caloriesFrom(macros: {
	readonly protein: string;
	readonly carbs: string;
	readonly fat: string;
}): number {
	return (
		grams(macros.protein) * CALORIES_PER_GRAM_PROTEIN +
		grams(macros.carbs) * CALORIES_PER_GRAM_CARBS +
		grams(macros.fat) * CALORIES_PER_GRAM_FAT
	);
}

/** The inline form that adds a typed name as a new food. */
export class NewFoodForm {
	/** The reference amount as typed; empty means 100 g or one of anything else. */
	base = $state('');
	/** The chosen unit, or undefined for the user's default. */
	unit: string | undefined = $state();
	calories = $state('');
	protein = $state('');
	carbs = $state('');
	fat = $state('');

	/**
	 * The unit the form is on.
	 *
	 * @param fallback - The user's default unit for new foods.
	 */
	unitOr(fallback: string): string {
		return this.unit ?? fallback;
	}

	/**
	 * What the form creates.
	 *
	 * @param name - The search text.
	 * @param trackCarbsAndFat - Whether calories come from protein, carbs, and fat.
	 * @param fallbackUnit - The user's default unit for new foods.
	 */
	toCommand(
		name: string,
		trackCarbsAndFat: boolean,
		fallbackUnit: string = FoodUnit.serving
	): CreateFoodCommand {
		const unit = this.unitOr(fallbackUnit);
		const typedBase = parseDecimal(this.base) ?? 0;
		const amount = typedBase > 0 ? typedBase : defaultAmount(unit);
		const trimmed = name.trim();
		return {
			name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
			reference: { amount, unit },
			macrosPerReference: {
				calories: trackCarbsAndFat ? caloriesFrom(this) : grams(this.calories),
				protein: grams(this.protein),
				carbs: trackCarbsAndFat ? grams(this.carbs) : 0,
				fat: trackCarbsAndFat ? grams(this.fat) : 0
			}
		};
	}

	/**
	 * Fills the form with a food's portion and macros, for editing it.
	 *
	 * @param food - The food.
	 */
	fill(food: Food): void {
		this.base = amountText(food.reference.amount);
		this.unit = food.reference.unit;
		this.calories = String(food.macrosPerReference.calories);
		this.protein = String(food.macrosPerReference.protein);
		this.carbs = String(food.macrosPerReference.carbs);
		this.fat = String(food.macrosPerReference.fat);
	}

	/** Clears the form. */
	reset(): void {
		this.base = '';
		this.unit = undefined;
		this.calories = '';
		this.protein = '';
		this.carbs = '';
		this.fat = '';
	}
}
