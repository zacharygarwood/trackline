import type { LocalDate } from '../../shared/local-date.ts';
import { err, type Result } from '../../shared/result.ts';
import { logFood, type FoodLogEntry } from '../domain/food-log-entry.ts';
import type { FoodId } from '../domain/ids.ts';
import type { MealSlot } from '../domain/meal-slot.constants.ts';
import type { FoodReader } from '../domain/nutrition-repositories.ts';
import type { InvalidAmount } from '../domain/portion.ts';
import { NotFound, type Creation, type FoodLog } from './nutrition-ports.ts';

/** What was eaten, how much, and when. */
export interface LogFoodCommand {
	readonly foodId: FoodId;
	readonly amount: number;
	readonly date: LocalDate;
	readonly slot: MealSlot;
}

/** What logging a food needs. */
export interface LogFoodPorts extends Creation {
	readonly foods: FoodReader;
	readonly log: FoodLog;
}

/** Logs an amount of a food under a meal slot, snapshotting its macros. */
export class LogFood {
	constructor(private readonly ports: LogFoodPorts) {}

	/** @param command - The food, amount, day, and slot. */
	async execute(command: LogFoodCommand): Promise<Result<FoodLogEntry, InvalidAmount | NotFound>> {
		const { foods, log, clock, ids } = this.ports;
		const food = await foods.findById(command.foodId);
		if (food === undefined) return err(new NotFound(command.foodId));
		const entry = logFood(food, command.amount, {
			id: ids.next(),
			date: command.date,
			slot: command.slot,
			loggedAt: clock.now()
		});
		if (entry.ok) await log.save([entry.value]);
		return entry;
	}
}
