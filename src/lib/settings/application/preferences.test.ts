import { describe, expect, it } from 'vitest';
import { InMemoryPreferences } from '../../../../tests/fakes/in-memory-preferences.ts';
import { expectErr } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Accent, Theme } from '../domain/preferences.constants.ts';
import { DEFAULT_PREFERENCES, InvalidWeeklyWorkoutGoal } from '../domain/preferences.ts';
import { GetPreferences } from './get-preferences.ts';
import { UpdatePreferences } from './update-preferences.ts';

function useCases() {
	const store = new InMemoryPreferences();
	return { get: new GetPreferences(store), update: new UpdatePreferences(store) };
}

describe('preferences', () => {
	it('starts dark, sky blue, calories and protein only, miles, servings, 90 s rest, 4 workouts', async () => {
		const { get } = useCases();

		expect(await get.execute()).toEqual(DEFAULT_PREFERENCES);
	});

	it('keeps changes and leaves the rest alone', async () => {
		const { get, update } = useCases();

		await update.execute({ theme: Theme.light, accent: Accent.rose });
		await update.execute({ distanceUnit: DistanceUnit.km, weeklyWorkoutGoal: 3 });

		expect(await get.execute()).toEqual({
			...DEFAULT_PREFERENCES,
			theme: Theme.light,
			accent: Accent.rose,
			distanceUnit: DistanceUnit.km,
			weeklyWorkoutGoal: 3
		});
	});

	it.each([0, 8, 2.5])('rejects a goal of %d workouts a week', async (goal) => {
		const { get, update } = useCases();

		const result = await update.execute({ weeklyWorkoutGoal: goal });

		expect(expectErr(result)).toBeInstanceOf(InvalidWeeklyWorkoutGoal);
		expect((await get.execute()).weeklyWorkoutGoal).toBe(DEFAULT_PREFERENCES.weeklyWorkoutGoal);
	});
});
