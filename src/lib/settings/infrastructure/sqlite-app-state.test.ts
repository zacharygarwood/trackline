import { describe, expect, it } from 'vitest';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import {
	SqliteEntryRepository,
	SqliteTrackerRepository
} from '../../tracking/infrastructure/sqlite-tracking-repositories.ts';
import { aKey, anEntry, aTracker } from '../../../../tests/builders/tracking.builder.ts';
import { anId } from '../../../../tests/builders/id.builder.ts';
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

	it('remembers that the install hint was dismissed', async () => {
		const state = new SqliteAppState(await migratedDatabase());
		expect(await state.isInstallHintDismissed()).toBe(false);

		await state.dismissInstallHint();

		expect(await state.isInstallHintDismissed()).toBe(true);
	});
});

describe('SqliteDataInventory', () => {
	it('counts stored records', async () => {
		const database = await migratedDatabase();
		const tracker = aTracker();
		await new SqliteTrackerRepository(database).save([tracker]);
		const entries = new SqliteEntryRepository(database);
		await entries.save(anEntry({ trackerId: tracker.id }));
		await entries.save(
			anEntry({
				trackerId: tracker.id,
				values: [[aKey('photo'), { type: 'photo', photoId: anId<'Photo'>() }]]
			})
		);

		expect(await new SqliteDataInventory(database).count()).toEqual({
			trackers: 1,
			entries: 2,
			photos: 1
		});
	});
});
