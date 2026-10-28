import { describe, expect, it } from 'vitest';
import { InMemoryMassUnitPreference } from '../../../../tests/fakes/in-memory-mass-unit-preference.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { GetMassUnit } from '../application/get-mass-unit.ts';
import { SetMassUnit } from '../application/set-mass-unit.ts';
import { UnitsSetting } from './units-setting.svelte.ts';

describe('UnitsSetting', () => {
	it('shows and stores the chosen unit', async () => {
		const preference = new InMemoryMassUnitPreference();
		const setting = new UnitsSetting({
			getMassUnit: new GetMassUnit(preference),
			setMassUnit: new SetMassUnit(preference)
		});
		await setting.load();

		await setting.choose(MassUnit.lb);

		expect(setting.unit).toBe(MassUnit.lb);
		expect(await preference.read()).toBe(MassUnit.lb);
	});
});
