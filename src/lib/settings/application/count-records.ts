import type { DataCounts, DataInventory } from '../domain/data-inventory.ts';

/** Counts what is stored, so destructive actions can say exactly what they remove. */
export class CountRecords {
	constructor(private readonly inventory: DataInventory) {}

	/** @returns The number of records of each kind. */
	execute(): Promise<DataCounts> {
		return this.inventory.count();
	}
}
