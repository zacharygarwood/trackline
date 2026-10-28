import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { first } from '../../shared/collections.ts';
import type { DataCounts, DataInventory } from '../domain/data-inventory.ts';
import { COUNT_RECORDS, CountColumn } from './app-setting.sql.ts';

function countIn(row: SqlRow | undefined, column: string): number {
	const count = row?.[column];
	if (typeof count !== 'number') throw new Error('Could not count records');
	return count;
}

/** Counts records with one SQL query across the tables of every context. */
export class SqliteDataInventory implements DataInventory {
	constructor(private readonly database: SqlDriver) {}

	/**
	 * {@inheritDoc DataInventory.count}
	 *
	 * @throws If the database returns no counts.
	 */
	async count(): Promise<DataCounts> {
		const row = first(await this.database.query(COUNT_RECORDS));
		return {
			weighIns: countIn(row, CountColumn.weighIns),
			workouts: countIn(row, CountColumn.workouts),
			foodEntries: countIn(row, CountColumn.foodEntries),
			photos: countIn(row, CountColumn.photos)
		};
	}
}
