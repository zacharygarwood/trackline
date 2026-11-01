import { describe, expect, it } from 'vitest';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { FoodUnit } from '../../shared/food-unit.constants.ts';
import { HomeTracker, Theme } from '../domain/preferences.constants.ts';
import type { Preferences } from '../domain/preferences.ts';
import { PreferencesMapper } from './preferences.mapper.ts';
import { SqlitePreferences } from './sqlite-preferences.ts';

const everything: Preferences = {
	theme: Theme.forest,
	trackCarbsAndFat: true,
	distanceUnit: DistanceUnit.km,
	newFoodUnit: FoodUnit.g,
	restSeconds: 120,
	weeklyWorkoutGoal: 5,
	homeTrackers: [HomeTracker.weight, HomeTracker.carbs, HomeTracker.workouts]
};

describe('PreferencesMapper', () => {
	it('round-trips every preference', () => {
		expect(expectOk(PreferencesMapper.toDomain(PreferencesMapper.toRows(everything)))).toEqual(
			everything
		);
	});

	it('round-trips an empty Home', () => {
		const rows = PreferencesMapper.toRows({ homeTrackers: [] });

		expect(expectOk(PreferencesMapper.toDomain(rows))).toEqual({ homeTrackers: [] });
	});

	it('round-trips a switched-off flag', () => {
		const rows = PreferencesMapper.toRows({ trackCarbsAndFat: false });

		expect(expectOk(PreferencesMapper.toDomain(rows))).toEqual({ trackCarbsAndFat: false });
	});

	it.each([
		['theme', 'sepia'],
		['rest_seconds', '45'],
		['weekly_workout_goal', '9'],
		['track_carbs_and_fat', 'yes'],
		['home_trackers', 'calories,steps']
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
