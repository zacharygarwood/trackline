import { describe, expect, it } from 'vitest';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { SqliteMassUnitPreference } from './sqlite-mass-unit-preference.ts';

describe('SqliteMassUnitPreference', () => {
	it('has no unit until one is written', async () => {
		expect(await new SqliteMassUnitPreference(await migratedDatabase()).read()).toBeUndefined();
	});

	it('keeps the latest unit', async () => {
		const preference = new SqliteMassUnitPreference(await migratedDatabase());
		await preference.write(MassUnit.lb);
		await preference.write(MassUnit.kg);

		expect(await preference.read()).toBe(MassUnit.kg);
	});

	it('fails loudly on an unknown stored unit', async () => {
		const database = await migratedDatabase();
		await database.execute({
			name: 'insert corrupt setting',
			sql: "INSERT INTO app_setting (key, value) VALUES ('mass_unit', 'stone')",
			params: []
		});

		await expect(new SqliteMassUnitPreference(database).read()).rejects.toThrow('Corrupt');
	});
});
