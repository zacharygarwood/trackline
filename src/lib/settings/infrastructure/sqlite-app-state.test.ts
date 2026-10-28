import { describe, expect, it } from 'vitest';
import { aWeighIn } from '../../../../tests/builders/weigh-in.builder.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { SqliteWeighInRepository } from '../../body/infrastructure/sqlite-weigh-in-repository.ts';
import { SqliteAppState } from './sqlite-app-state.ts';
import { SqliteDataInventory } from './sqlite-data-inventory.ts';

describe('SqliteAppState', () => {
	it('remembers the last export time', async () => {
		const state = new SqliteAppState(await migratedDatabase());
		expect(await state.read()).toBeUndefined();

		await state.write(1_700_000_000_000);

		expect(await state.read()).toBe(1_700_000_000_000);
	});

	it('remembers that setup is complete', async () => {
		const state = new SqliteAppState(await migratedDatabase());
		expect(await state.isComplete()).toBe(false);

		await state.markComplete();

		expect(await state.isComplete()).toBe(true);
	});
});

describe('SqliteDataInventory', () => {
	it('counts stored records', async () => {
		const database = await migratedDatabase();
		const weighIns = new SqliteWeighInRepository(database);
		await weighIns.save(aWeighIn().on('2026-10-01').build());
		await weighIns.save(aWeighIn().on('2026-10-02').build());

		expect(await new SqliteDataInventory(database).count()).toEqual({
			weighIns: 2,
			workouts: 0,
			foodEntries: 0,
			photos: 0
		});
	});
});
