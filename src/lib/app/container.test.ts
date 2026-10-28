import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../tests/fakes/fixed-clock.ts';
import { migratedDatabase } from '../../../tests/support/migrated-database.ts';
import { expectOk } from '../../../tests/support/result.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { Mass } from '../shared/mass.ts';
import { wireApp } from './container.ts';

describe('wireApp', () => {
	it('connects use cases to the real repositories', async () => {
		const clock = new FixedClock(Date.UTC(2026, 9, 27));
		const app = wireApp(await migratedDatabase(), clock);

		expectOk(
			await app.body.recordWeighIn.execute({
				date: clock.today(),
				weight: expectOk(Mass.fromKg(80))
			})
		);
		await app.settings.setMassUnit.execute({ unit: MassUnit.lb });

		expect(await app.body.listWeighIns.execute()).toHaveLength(1);
		expect(await app.settings.getMassUnit.execute()).toBe(MassUnit.lb);
	});
});
