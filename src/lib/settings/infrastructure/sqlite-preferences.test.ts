import { describe, expect, it } from 'vitest';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Theme } from '../domain/preferences.constants.ts';
import type { Preferences } from '../domain/preferences.ts';
import { PreferencesMapper } from './preferences.mapper.ts';
import { SqlitePreferences } from './sqlite-preferences.ts';

const everything: Preferences = {
	theme: Theme.forest,
	distanceUnit: DistanceUnit.km,
	restSeconds: 120
};

describe('PreferencesMapper', () => {
	it('round-trips every preference', () => {
		expect(expectOk(PreferencesMapper.toDomain(PreferencesMapper.toRows(everything)))).toEqual(
			everything
		);
	});

	it.each([
		['theme', 'sepia'],
		['rest_seconds', '45'],
		['distance_unit', 'leagues']
	])('rejects %s = %s', (key, value) => {
		expect(expectErr(PreferencesMapper.toDomain([{ key, value }])).reason).toBe('invalid value');
	});
});

describe('SqlitePreferences', () => {
	it('has nothing set at first', async () => {
		expect(await new SqlitePreferences(await migratedDatabase()).read()).toEqual({});
	});

	it('keeps each change and leaves the others alone', async () => {
		const preferences = new SqlitePreferences(await migratedDatabase());
		await preferences.write(everything);
		await preferences.write({ theme: Theme.sand });

		expect(await preferences.read()).toEqual({ ...everything, theme: Theme.sand });
	});

	it('ignores the accent color older versions stored', async () => {
		const database = await migratedDatabase();
		await database.execute({
			name: 'insert old accent',
			sql: "INSERT INTO app_setting (key, value) VALUES ('accent', 'violet')",
			params: []
		});

		expect(await new SqlitePreferences(database).read()).toEqual({});
	});

	it('fails loudly on a value the app never writes', async () => {
		const database = await migratedDatabase();
		await database.execute({
			name: 'insert corrupt setting',
			sql: "INSERT INTO app_setting (key, value) VALUES ('theme', 'teal')",
			params: []
		});

		await expect(new SqlitePreferences(database).read()).rejects.toThrow('Corrupt');
	});
});
