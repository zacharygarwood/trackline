import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../tests/fakes/fixed-clock.ts';
import { InMemoryDatabaseFile } from '../../../tests/fakes/in-memory-database-file.ts';
import { InMemoryFoodDatabase } from '../../../tests/fakes/in-memory-food-database.ts';
import { FakeImages } from '../../../tests/fakes/in-memory-photos.ts';
import { InMemoryPhotoFolder } from '../../../tests/fakes/in-memory-photo-folder.ts';
import { migratedDatabase } from '../../../tests/support/migrated-database.ts';
import { expectOk } from '../../../tests/support/result.ts';
import { MassUnit } from '../shared/mass-unit.constants.ts';
import { WeekStart } from '../shared/week-start.constants.ts';
import { templateOf } from '../tracking/domain/from-template.ts';
import { TemplateKey } from '../tracking/domain/template.constants.ts';
import { FieldType } from '../tracking/domain/tracking.constants.ts';
import { fieldKey } from '../tracking/domain/field.ts';
import { templatePick } from '../tracking/ui/template-text.ts';
import { wireApp } from './container.ts';

describe('wireApp', () => {
	it('connects use cases to the real repositories and photo folder', async () => {
		const clock = new FixedClock(Date.UTC(2026, 9, 27));
		const app = wireApp({
			database: await migratedDatabase(),
			databaseFile: new InMemoryDatabaseFile(),
			photoFolder: new InMemoryPhotoFolder(),
			images: new FakeImages(),
			foods: new InMemoryFoodDatabase(),
			clock
		});

		const [photos] = expectOk(
			await app.tracking.addTrackers.execute({
				picks: [templatePick(templateOf(TemplateKey.bodyPhotos))]
			})
		);
		const photoId = expectOk(await app.tracking.savePhoto.execute({ image: Uint8Array.of(1) }));
		expectOk(
			await app.tracking.logEntry.execute({
				trackerId: photos?.id ?? never(),
				values: new Map([[fieldKey('photo'), { type: FieldType.photo, photoId }]])
			})
		);
		await app.settings.setMassUnit.execute({ unit: MassUnit.lb });

		expect(await app.settings.getMassUnit.execute()).toBe(MassUnit.lb);
		expect(await app.settings.countRecords.execute()).toEqual({
			trackers: 1,
			entries: 1,
			photos: 1
		});
		expect(await app.tracking.listHome.execute({ weekStart: WeekStart.monday })).toHaveLength(1);
	});
});

function never(): never {
	throw new Error('No tracker was added');
}
