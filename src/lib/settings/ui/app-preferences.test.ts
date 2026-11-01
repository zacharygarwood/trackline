import { describe, expect, it } from 'vitest';
import { InMemoryMassUnitPreference } from '../../../../tests/fakes/in-memory-mass-unit-preference.ts';
import { InMemoryPreferences } from '../../../../tests/fakes/in-memory-preferences.ts';
import { InMemoryWeekStartPreference } from '../../../../tests/fakes/in-memory-week-start-preference.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { GetMassUnit } from '../application/get-mass-unit.ts';
import { GetPreferences } from '../application/get-preferences.ts';
import { GetWeekStart } from '../application/get-week-start.ts';
import { SetMassUnit } from '../application/set-mass-unit.ts';
import { SetWeekStart } from '../application/set-week-start.ts';
import { UpdatePreferences } from '../application/update-preferences.ts';
import { Theme } from '../domain/preferences.constants.ts';
import { AppPreferences } from './app-preferences.svelte.ts';

function useCases() {
	const stored = new InMemoryPreferences();
	const mass = new InMemoryMassUnitPreference();
	const week = new InMemoryWeekStartPreference();
	return {
		getPreferences: new GetPreferences(stored),
		updatePreferences: new UpdatePreferences(stored),
		getMassUnit: new GetMassUnit(mass),
		setMassUnit: new SetMassUnit(mass),
		getWeekStart: new GetWeekStart(week),
		setWeekStart: new SetWeekStart(week)
	};
}

describe('AppPreferences', () => {
	it('keeps a change made before the stored preferences were read', async () => {
		const cases = useCases();
		const preferences = new AppPreferences();

		const changed = preferences.change({ theme: Theme.light });
		await preferences.load(cases);
		await changed;

		expect(preferences.current.theme).toBe(Theme.light);
	});

	it('loads, changes, and keeps preferences and units', async () => {
		const cases = useCases();
		const preferences = new AppPreferences();
		await preferences.load(cases);

		await preferences.change({ theme: Theme.light });
		await preferences.chooseMassUnit(MassUnit.lb);
		await preferences.chooseWeekStart(WeekStart.sunday);

		const reloaded = new AppPreferences();
		await reloaded.load(cases);
		expect(reloaded.loaded).toBe(true);
		expect(reloaded.current.theme).toBe(Theme.light);
		expect([reloaded.massUnit, reloaded.weekStart]).toEqual([MassUnit.lb, WeekStart.sunday]);
	});
});
