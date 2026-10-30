import type { Clock } from '../../shared/clock.ts';
import { hourOf, parseDecimal } from '../../ui/format.ts';
import type { ChangeLogAmount } from '../application/change-log-amount.ts';
import type { CreateFood } from '../application/create-food.ts';
import type { DeleteLogEntry } from '../application/delete-log-entry.ts';
import type { DayNutrition, GetDayNutrition } from '../application/get-day-nutrition.ts';
import type { ListFoods } from '../application/list-foods.ts';
import type { LogFood } from '../application/log-food.ts';
import type { RestoreLogEntry } from '../application/restore-log-entry.ts';
import type { FoodLogEntry } from '../domain/food-log-entry.ts';
import type { Food } from '../domain/food.ts';
import type { FoodId, FoodLogEntryId } from '../domain/ids.ts';
import { mealSlotAt } from '../domain/meal-slot.ts';
import { amountText, stepAmount } from './food-portions.ts';
import { NewFoodForm } from './new-food-form.svelte.ts';

/** The use cases the Food tab calls. */
export interface FoodScreenUseCases {
	readonly getDayNutrition: GetDayNutrition;
	readonly listFoods: ListFoods;
	readonly createFood: CreateFood;
	readonly logFood: LogFood;
	readonly changeLogAmount: ChangeLogAmount;
	readonly deleteLogEntry: DeleteLogEntry;
	readonly restoreLogEntry: RestoreLogEntry;
}

/** How many recent foods show before anything is typed. */
const RECENT_FOODS = 6;

const EMPTY_DAY: DayNutrition = {
	entries: [],
	summary: {
		eaten: { calories: 0, protein: 0, carbs: 0, fat: 0 },
		targets: undefined,
		remaining: undefined
	}
};

/** State and actions of the Food tab: today's totals, finding and adding foods, and what was eaten. */
export class FoodScreen {
	day: DayNutrition = $state(EMPTY_DAY);
	foods: readonly Food[] = $state([]);
	query = $state('');
	/** The food whose amount stepper is open. */
	openFood: FoodId | undefined = $state();
	/** The amount typed in the open food's stepper. */
	amount = $state('');
	/** The eaten entry whose stepper is open. */
	openEntry: FoodLogEntryId | undefined = $state();
	readonly form = new NewFoodForm();

	constructor(
		private readonly useCases: FoodScreenUseCases,
		private readonly clock: Clock
	) {}

	/** Loads today's log and the food library. */
	async load(): Promise<void> {
		[this.day, this.foods] = await Promise.all([
			this.useCases.getDayNutrition.execute({ date: this.clock.today() }),
			this.useCases.listFoods.execute()
		]);
	}

	/** Foods matching the search, or the six most recently logged. */
	get visibleFoods(): readonly Food[] {
		const typed = this.query.trim().toLowerCase();
		return typed === ''
			? this.foods.slice(0, RECENT_FOODS)
			: this.foods.filter((food) => food.name.toLowerCase().includes(typed));
	}

	/** Whether the search could become a new food: something typed, and no food has that name. */
	get canCreate(): boolean {
		const typed = this.query.trim().toLowerCase();
		return typed !== '' && !this.foods.some((food) => food.name.toLowerCase() === typed);
	}

	/** Changes the search and closes any open stepper. */
	search(text: string): void {
		this.query = text;
		this.openFood = undefined;
	}

	/** Opens or closes a food's amount stepper, starting at its reference amount. */
	toggleFood(food: Food): void {
		this.openFood = this.openFood === food.id ? undefined : food.id;
		this.amount = amountText(food.reference.amount);
	}

	/** Moves the open food's amount one step up (1) or down (-1). */
	stepFoodAmount(food: Food, direction: number): void {
		const current = parseDecimal(this.amount) ?? 0;
		this.amount = amountText(stepAmount(current, food.reference.unit, direction));
	}

	/**
	 * Logs a food for today in the meal slot of the current hour.
	 *
	 * @param food - The food.
	 * @param amount - How much; its reference amount if not given.
	 * @returns The new entry, or undefined if the amount was invalid.
	 */
	async add(food: Food, amount = food.reference.amount): Promise<FoodLogEntry | undefined> {
		const result = await this.useCases.logFood.execute({
			foodId: food.id,
			amount,
			date: this.clock.today(),
			slot: mealSlotAt(hourOf(this.clock.now()))
		});
		this.openFood = undefined;
		await this.load();
		return result.ok ? result.value : undefined;
	}

	/** Logs the open food's typed amount. */
	addTyped(food: Food): Promise<FoodLogEntry | undefined> {
		return this.add(food, parseDecimal(this.amount) ?? 0);
	}

	/**
	 * Saves the search text as a new food and logs one portion of it.
	 *
	 * @param trackCarbsAndFat - Whether the form asked for carbs and fat instead of calories.
	 * @param defaultUnit - The user's unit for new foods, when none was picked.
	 * @returns The new entry, or undefined if the food was invalid.
	 */
	async create(trackCarbsAndFat: boolean, defaultUnit: string): Promise<FoodLogEntry | undefined> {
		const created = await this.useCases.createFood.execute(
			this.form.toCommand(this.query, trackCarbsAndFat, defaultUnit)
		);
		if (!created.ok) return undefined;
		this.query = '';
		this.form.reset();
		return this.add(created.value);
	}

	/** Opens or closes an eaten entry's stepper. */
	toggleEntry(id: FoodLogEntryId): void {
		this.openEntry = this.openEntry === id ? undefined : id;
	}

	/** Changes how much of an entry was eaten. */
	async changeAmount(entry: FoodLogEntry, amount: number): Promise<void> {
		if (Number.isNaN(amount) || amount <= 0) return;
		await this.useCases.changeLogAmount.execute({ id: entry.id, amount });
		await this.load();
	}

	/** Moves an entry's amount one step up (1) or down (-1). */
	stepEntry(entry: FoodLogEntry, direction: number): Promise<void> {
		return this.changeAmount(entry, stepAmount(entry.amount, entry.unitSnapshot, direction));
	}

	/** Removes an entry. */
	async remove(entry: FoodLogEntry): Promise<void> {
		await this.useCases.deleteLogEntry.execute({ id: entry.id });
		this.openEntry = undefined;
		await this.load();
	}

	/** Puts back a removed entry. */
	async restore(entry: FoodLogEntry): Promise<void> {
		await this.useCases.restoreLogEntry.execute({ entry });
		await this.load();
	}
}
