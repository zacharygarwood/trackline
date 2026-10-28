import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { DataCounts, DataInventory } from '../domain/data-inventory.ts';
import { COUNT_RECORDS } from './app-setting.sql.ts';

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
		const weighIns = row?.weigh_ins;
		const workouts = row?.workouts;
		if (typeof weighIns !== 'number' || typeof workouts !== 'number') {
			throw new Error('Could not count records');
		}
		return { weighIns, workouts };
	}
}
