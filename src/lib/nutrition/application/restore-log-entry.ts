import type { FoodLogEntry } from '../domain/food-log-entry.ts';
import type { FoodLogWriter } from '../domain/nutrition-repositories.ts';

/** The entry to put back. */
export interface RestoreLogEntryCommand {
	readonly entry: FoodLogEntry;
}

/** Undoes removing a food log entry: it comes back exactly as it was. */
export class RestoreLogEntry {
	constructor(private readonly log: FoodLogWriter) {}

	/** @param command - The removed entry. */
	async execute(command: RestoreLogEntryCommand): Promise<void> {
		await this.log.save([command.entry]);
	}
}
