import { err, type Result } from '../../shared/result.ts';
import { changeAmount, type FoodLogEntry } from '../domain/food-log-entry.ts';
import type { FoodLogEntryId } from '../domain/ids.ts';
import type { InvalidAmount } from '../domain/portion.ts';
import { NotFound, type FoodLog } from './nutrition-ports.ts';

/** Which entry and its corrected amount. */
export interface ChangeLogAmountCommand {
	readonly id: FoodLogEntryId;
	readonly amount: number;
}

/** Adjusts how much of a logged food was eaten. */
export class ChangeLogAmount {
	constructor(private readonly log: FoodLog) {}

	/** @param command - The entry and amount. */
	async execute(
		command: ChangeLogAmountCommand
	): Promise<Result<FoodLogEntry, InvalidAmount | NotFound>> {
		const entry = await this.log.findById(command.id);
		if (entry === undefined) return err(new NotFound(command.id));
		const changed = changeAmount(entry, command.amount);
		if (changed.ok) await this.log.save([changed.value]);
		return changed;
	}
}
