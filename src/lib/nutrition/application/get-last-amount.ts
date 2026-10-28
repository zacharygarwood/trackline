import type { FoodId } from '../domain/ids.ts';
import type { FoodLogReader } from '../domain/nutrition-repositories.ts';

/** The food to look up. */
export interface GetLastAmountCommand {
	readonly foodId: FoodId;
}

/** The amount last logged for a food, to pre-fill the next time. */
export class GetLastAmount {
	constructor(private readonly log: FoodLogReader) {}

	/** @returns The last logged amount, or undefined if the food was never logged. */
	async execute(command: GetLastAmountCommand): Promise<number | undefined> {
		return (await this.log.findLastFor(command.foodId))?.amount;
	}
}
