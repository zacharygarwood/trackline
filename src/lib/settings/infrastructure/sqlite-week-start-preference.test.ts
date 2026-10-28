import { describe, expect, it } from 'vitest';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { SqliteWeekStartPreference } from './sqlite-week-start-preference.ts';

describe('SqliteWeekStartPreference', () => {
	it('has no choice until one is written', async () => {
		expect(await new SqliteWeekStartPreference(await migratedDatabase()).read()).toBeUndefined();
	});

	it('keeps the latest choice', async () => {
		const preference = new SqliteWeekStartPreference(await migratedDatabase());
		await preference.write(WeekStart.sunday);

		expect(await preference.read()).toBe(WeekStart.sunday);
	});

	it('fails loudly on an unknown stored day', async () => {
		const database = await migratedDatabase();
		await database.execute({
			name: 'insert corrupt setting',
			sql: "INSERT INTO app_setting (key, value) VALUES ('week_start', 'friday')",
			params: []
		});

		await expect(new SqliteWeekStartPreference(database).read()).rejects.toThrow('Corrupt');
	});
});
