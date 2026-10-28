import type { FoodLogEntryId } from '../domain/ids.ts';
import type { FoodLogWriter } from '../domain/nutrition-repositories.ts';

/** Which entry to remove. */
export interface DeleteLogEntryCommand {
	readonly id: FoodLogEntryId;
}

/** Removes an entry from the food log. */
export class DeleteLogEntry {
	constructor(private readonly log: FoodLogWriter) {}

	/** @param command - The entry. */
	async execute(command: DeleteLogEntryCommand): Promise<void> {
		await this.log.delete(command.id);
	}
}
