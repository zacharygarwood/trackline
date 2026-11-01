import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
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

/** State and actions of the Food tab and its pages: today's totals, finding and adding foods, and what was eaten. */
export class FoodScreen {
	day: DayNutrition = $state(EMPTY_DAY);
	foods: readonly Food[] = $state([]);
	query = $state('');
	/** The day shown, when it is not today. */
	date: LocalDate | undefined = $state();
	/** The amount typed on a food's page. */
	amount = $state('');
	readonly form = new NewFoodForm();

	constructor(
		private readonly useCases: FoodScreenUseCases,
		private readonly clock: Clock
	) {}

	/** Loads the day's log (today unless another day is chosen) and the food library. */
	async load(): Promise<void> {
		[this.day, this.foods] = await Promise.all([
			this.useCases.getDayNutrition.execute({ date: this.date ?? this.clock.today() }),
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

	/** Changes the search. */
	search(text: string): void {
		this.query = text;
	}

	/**
	 * The food a page was opened for.
	 *
	 * @param id - The id passed to the page, if any.
	 */
	findFood(id: string | undefined): Food | undefined {
		return this.foods.find((food) => food.id === id);
	}

	/**
	 * The eaten entry a page was opened for.
	 *
	 * @param id - The id passed to the page, if any.
	 */
	findEntry(id: string | undefined): FoodLogEntry | undefined {
		return this.day.entries.find((entry) => entry.id === id);
	}

	/** Starts a food's amount at its usual portion. */
	choose(food: Food): void {
		this.amount = amountText(food.reference.amount);
	}

	/** Moves the chosen food's amount one step up (1) or down (-1). */
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
		await this.load();
		return result.ok ? result.value : undefined;
	}

	/** Logs the chosen food's typed amount. */
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
		await this.load();
	}

	/** Puts back a removed entry. */
	async restore(entry: FoodLogEntry): Promise<void> {
		await this.useCases.restoreLogEntry.execute({ entry });
		await this.load();
	}
}
