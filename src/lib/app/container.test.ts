import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../tests/fakes/fixed-clock.ts';
import { FakeImageProcessor } from '../../../tests/fakes/fake-image-processor.ts';
import { InMemoryPhotoFolder } from '../../../tests/fakes/in-memory-photo-folder.ts';
import { InMemoryDatabaseFile } from '../../../tests/fakes/in-memory-database-file.ts';
import { migratedDatabase } from '../../../tests/support/migrated-database.ts';
import { expectOk } from '../../../tests/support/result.ts';
import { StatsRange } from '../insights/application/stats-range.constants.ts';
import { Pose } from '../body/domain/pose.constants.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { Mass } from '../shared/mass.ts';
import { wireApp } from './container.ts';

describe('wireApp', () => {
	it('connects use cases to the real repositories', async () => {
		const clock = new FixedClock(Date.UTC(2026, 9, 27));
		const app = wireApp({
			database: await migratedDatabase(),
			databaseFile: new InMemoryDatabaseFile(),
			photoFolder: new InMemoryPhotoFolder(),
			images: new FakeImageProcessor(),
			clock
		});

		expectOk(
			await app.body.recordWeighIn.execute({
				date: clock.today(),
				weight: expectOk(Mass.fromKg(80))
			})
		);
		await app.settings.setMassUnit.execute({ unit: MassUnit.lb });

		expect(await app.body.listWeighIns.execute()).toHaveLength(1);
		expect(await app.settings.getMassUnit.execute()).toBe(MassUnit.lb);
		expectOk(
			await app.body.addProgressPhoto.execute({
				date: clock.today(),
				pose: Pose.front,
				image: Uint8Array.of(1)
			})
		);
		expect(await app.settings.countRecords.execute()).toEqual({
			weighIns: 1,
			workouts: 0,
			foodEntries: 0,
			photos: 1
		});
		expect((await app.insights.getTrends.execute({ range: StatsRange.all })).weight).toHaveLength(
			1
		);
		expect(
			expectOk(await app.training.startWorkout.execute({ templateId: undefined })).date
		).toEqual(clock.today());
	});
});
