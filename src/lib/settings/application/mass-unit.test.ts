import { describe, expect, it } from 'vitest';
import { InMemoryMassUnitPreference } from '../../../../tests/fakes/in-memory-mass-unit-preference.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { GetMassUnit } from './get-mass-unit.ts';
import { SetMassUnit } from './set-mass-unit.ts';

describe('mass unit use cases', () => {
	it('defaults to kilograms', async () => {
		expect(await new GetMassUnit(new InMemoryMassUnitPreference()).execute()).toBe(MassUnit.kg);
	});

	it('remembers the chosen unit', async () => {
		const preference = new InMemoryMassUnitPreference();

		await new SetMassUnit(preference).execute({ unit: MassUnit.lb });

		expect(await new GetMassUnit(preference).execute()).toBe(MassUnit.lb);
	});
});
