import { messages } from '../../i18n/messages.en.ts';
import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { hourOf, parseDecimal } from '../../ui/format.ts';
import type { ChangeLogAmount } from '../application/change-log-amount.ts';
import type { CreateFood } from '../application/create-food.ts';
import type { DeleteLogEntry } from '../application/delete-log-entry.ts';
import type { DayNutrition, GetDayNutrition } from '../application/get-day-nutrition.ts';
import type { GetLastAmount } from '../application/get-last-amount.ts';
import type { ListFoods } from '../application/list-foods.ts';
import type { ListSavedMeals } from '../application/list-saved-meals.ts';
import type { LogFood } from '../application/log-food.ts';
import type { LogSavedMeal } from '../application/log-saved-meal.ts';
import type { SaveMealFromSlot } from '../application/save-meal-from-slot.ts';
import type { FoodLogEntry } from '../domain/food-log-entry.ts';
import { macrosForAmount, type Food } from '../domain/food.ts';
import type { FoodLogEntryId, SavedMealId } from '../domain/ids.ts';
import type { Macros } from '../domain/macros.ts';
import type { MealSlot } from '../domain/meal-slot.constants.ts';
import { mealSlotAt } from '../domain/meal-slot.ts';
import type { SavedMeal } from '../domain/saved-meal.ts';

/** The use cases the Eat and Today tabs call. */
export interface NutritionDayUseCases {
	readonly getDayNutrition: GetDayNutrition;
	readonly listFoods: ListFoods;
	readonly listSavedMeals: ListSavedMeals;
	readonly createFood: CreateFood;
	readonly logFood: LogFood;
	readonly logSavedMeal: LogSavedMeal;
	readonly changeLogAmount: ChangeLogAmount;
	readonly deleteLogEntry: DeleteLogEntry;
	readonly getLastAmount: GetLastAmount;
	readonly saveMealFromSlot: SaveMealFromSlot;
}

/** A new food as typed into the form; every field is still text. */
export interface FoodForm {
	readonly name: string;
	readonly amount: string;
	readonly unit: string;
	readonly calories: string;
	readonly protein: string;
	readonly carbs: string;
	readonly fat: string;
}

/** A typed number, or NaN so the domain rejects text that isn't one. */
const numberOf = (text: string) => parseDecimal(text) ?? Number.NaN;

const EMPTY_DAY: DayNutrition = {
	entries: [],
	summary: {
		eaten: { calories: 0, protein: 0, carbs: 0, fat: 0 },
		targets: undefined,
		remaining: undefined
	}
};

/** State and actions for one day of the food log. */
export class NutritionDay {
	date: LocalDate;
	day: DayNutrition = $state(EMPTY_DAY);
	foods: readonly Food[] = $state([]);
	meals: readonly SavedMeal[] = $state([]);

	constructor(
		private readonly useCases: NutritionDayUseCases,
		private readonly clock: Clock
	) {
		this.date = $state(clock.today());
	}

	/** Today's date. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** The meal slot that fits the current time, the default for new entries. */
	get suggestedSlot(): MealSlot {
		return mealSlotAt(hourOf(this.clock.now()));
	}

	/** Loads the shown day, the food library, and saved meals. */
	async load(): Promise<void> {
		[this.day, this.foods, this.meals] = await Promise.all([
			this.useCases.getDayNutrition.execute({ date: this.date }),
			this.useCases.listFoods.execute(),
			this.useCases.listSavedMeals.execute()
		]);
	}

	/** Shows the day before or after the current one. */
	async moveBy(days: number): Promise<void> {
		this.date = this.date.addDays(days);
		this.day = await this.useCases.getDayNutrition.execute({ date: this.date });
	}

	/** The entries logged under a meal slot. */
	entriesIn(slot: MealSlot): readonly FoodLogEntry[] {
		return this.day.entries.filter((entry) => entry.slot === slot);
	}

	/** The amount to pre-fill for a food: last time's amount, or its reference amount. */
	async suggestedAmount(food: Food): Promise<string> {
		return String(
			(await this.useCases.getLastAmount.execute({ foodId: food.id })) ?? food.reference.amount
		);
	}

	/** Live macros for an amount being typed, or undefined while it isn't valid. */
	preview(food: Food, amount: string): Macros | undefined {
		const parsed = parseDecimal(amount);
		const macros = parsed === undefined ? undefined : macrosForAmount(food, parsed);
		return macros?.ok === true ? macros.value : undefined;
	}

	/**
	 * Logs a food on the shown day.
	 *
	 * @returns A message to show if the amount was rejected.
	 */
	async log(food: Food, amount: string, slot: MealSlot): Promise<string | undefined> {
		const parsed = parseDecimal(amount) ?? 0;
		const result = await this.useCases.logFood.execute({
			foodId: food.id,
			amount: parsed,
			date: this.date,
			slot
		});
		if (!result.ok) return messages.nutrition.enterAmount;
		await this.load();
		return undefined;
	}

	/**
	 * Creates a food from the form.
	 *
	 * @returns The new food, or a message if a field was rejected.
	 */
	async createFood(form: FoodForm): Promise<Food | string> {
		const result = await this.useCases.createFood.execute({
			name: form.name,
			reference: { amount: numberOf(form.amount), unit: form.unit },
			macrosPerReference: {
				calories: numberOf(form.calories),
				protein: numberOf(form.protein),
				carbs: numberOf(form.carbs),
				fat: numberOf(form.fat)
			}
		});
		if (!result.ok) return messages.nutrition.checkFood;
		this.foods = await this.useCases.listFoods.execute();
		return result.value;
	}

	/** Logs every food of a saved meal on the shown day. */
	async logMeal(mealId: SavedMealId, slot: MealSlot): Promise<void> {
		await this.useCases.logSavedMeal.execute({ mealId, date: this.date, slot });
		await this.load();
	}

	/**
	 * Changes a logged amount.
	 *
	 * @returns A message to show if the amount was rejected.
	 */
	async changeAmount(id: FoodLogEntryId, amount: string): Promise<string | undefined> {
		const result = await this.useCases.changeLogAmount.execute({
			id,
			amount: parseDecimal(amount) ?? 0
		});
		if (!result.ok) return messages.nutrition.enterAmount;
		await this.load();
		return undefined;
	}

	/** Removes an entry. */
	async remove(id: FoodLogEntryId): Promise<void> {
		await this.useCases.deleteLogEntry.execute({ id });
		await this.load();
	}

	/**
	 * Saves a slot's entries as a meal.
	 *
	 * @returns A message to show if the name was rejected.
	 */
	async saveSlotAsMeal(slot: MealSlot, name: string): Promise<string | undefined> {
		const result = await this.useCases.saveMealFromSlot.execute({ date: this.date, slot, name });
		this.meals = await this.useCases.listSavedMeals.execute();
		return result.ok ? undefined : messages.nutrition.mealNameProblem;
	}
}
