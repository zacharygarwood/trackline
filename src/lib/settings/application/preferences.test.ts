import { describe, expect, it } from 'vitest';
import { InMemoryPreferences } from '../../../../tests/fakes/in-memory-preferences.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Theme } from '../domain/preferences.constants.ts';
import { DEFAULT_PREFERENCES } from '../domain/preferences.ts';
import { GetPreferences } from './get-preferences.ts';
import { UpdatePreferences } from './update-preferences.ts';

function useCases() {
	const store = new InMemoryPreferences();
	return { get: new GetPreferences(store), update: new UpdatePreferences(store) };
}

describe('preferences', () => {
	it('starts dark, in miles, with a 90 s rest timer', async () => {
		const { get } = useCases();

		expect(await get.execute()).toEqual(DEFAULT_PREFERENCES);
	});

	it('keeps changes and leaves the rest alone', async () => {
		const { get, update } = useCases();

		await update.execute({ theme: Theme.ocean });
		await update.execute({ distanceUnit: DistanceUnit.km });

		expect(await get.execute()).toEqual({
			...DEFAULT_PREFERENCES,
			theme: Theme.ocean,
			distanceUnit: DistanceUnit.km
		});
	});
});
