import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import {
	firstTracker,
	number,
	trackingApp,
	values,
	withTrackers
} from '../../../../tests/support/tracking-app.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { FieldType } from '../domain/tracking.constants.ts';
import { UnreadableImage } from './photo-ports.ts';
import { PhotoSize } from './photo-size.constants.ts';
import { SubjectNotFound, TrackerNotFound } from './tracking-errors.ts';

describe('logging', () => {
	it('logs today at the current time, and lists newest first', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);
		const first = expectOk(
			await app.logEntry.execute({ trackerId: tracker.id, values: values(['glasses', number(2)]) })
		);
		app.clock.advance(1000);
		const second = expectOk(
			await app.logEntry.execute({ trackerId: tracker.id, values: values(['glasses', number(1)]) })
		);

		expect(first.date.toString()).toBe('2026-10-29');
		expect(second.loggedAt - first.loggedAt).toBe(1000);
		expect(await app.listEntries.execute({ trackerId: tracker.id })).toEqual([second, first]);
	});

	it('refuses values that do not fit, and unknown trackers', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);

		expect(
			(
				await app.logEntry.execute({
					trackerId: tracker.id,
					values: values(['glasses', number(-1)])
				})
			).ok
		).toBe(false);
		expect(
			expectErr(
				await app.logEntry.execute({ trackerId: anId(), values: values(['glasses', number(1)]) })
			)
		).toBeInstanceOf(TrackerNotFound);
	});

	it('changes an entry, and deletes and restores it', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);
		const entry = expectOk(
			await app.logEntry.execute({ trackerId: tracker.id, values: values(['glasses', number(2)]) })
		);
		const changed = expectOk(
			await app.changeEntry.execute({ id: entry.id, values: values(['glasses', number(3)]) })
		);

		expect(changed.values.get(aKey('glasses'))).toEqual(number(3));
		expect(await app.deleteEntry.execute({ id: entry.id })).toEqual(changed);
		expect(await app.listEntries.execute({ trackerId: tracker.id })).toEqual([]);
		await app.restoreEntry.execute({ entry: changed });
		expect(await app.listEntries.execute({ trackerId: tracker.id })).toEqual([changed]);
		expect(await app.deleteEntry.execute({ id: anId() })).toBeUndefined();
	});

	it('deletes an entry with its photo', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.bodyPhotos);
		const photoId = expectOk(await app.savePhoto.execute({ image: Uint8Array.of(9) }));
		const entry = expectOk(
			await app.logEntry.execute({
				trackerId: tracker.id,
				values: values(['photo', { type: FieldType.photo, photoId }])
			})
		);

		expect(await app.getPhotoImage.execute({ id: photoId, size: PhotoSize.thumbnail })).toEqual(
			Uint8Array.of(2, 9)
		);
		await app.deleteEntry.execute({ id: entry.id });
		expect(app.photos.files.size).toBe(0);
	});
});

describe('photos', () => {
	it('refuses an unreadable image, and discards a photo that was not logged', async () => {
		const app = trackingApp();
		const photoId = expectOk(await app.savePhoto.execute({ image: Uint8Array.of(9) }));

		expect(expectErr(await app.savePhoto.execute({ image: new Uint8Array() }))).toBeInstanceOf(
			UnreadableImage
		);
		await app.discardPhoto.execute({ id: photoId });
		expect(await app.getPhotoImage.execute({ id: photoId, size: PhotoSize.full })).toBeUndefined();
	});
});

describe('libraries', () => {
	it('adds, renames, and deletes things, keeping deleted ones for their entries', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.plants);
		const fern = expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name: 'Fern',
				fieldKeys: [],
				defaults: new Map()
			})
		);
		const renamed = expectOk(
			await app.updateSubject.execute({
				id: fern.id,
				name: 'Boston fern',
				fieldKeys: [],
				defaults: new Map()
			})
		);
		await app.archiveSubject.execute({ id: fern.id });

		expect(renamed.name).toBe('Boston fern');
		expect(await app.listSubjects.execute({ trackerId: tracker.id })).toEqual([]);
		expect(await app.listSubjects.execute({ trackerId: tracker.id, archived: true })).toEqual([
			{ ...renamed, archived: true }
		]);
		expect((await app.getSubject.execute({ id: fern.id }))?.archived).toBe(true);
	});

	it('refuses things for unknown trackers and entries about another tracker’s things', async () => {
		const { app, trackers } = await withTrackers(TemplateKey.plants, TemplateKey.food);
		const [plants, food] = [
			trackers.at(0)?.id ?? anId<'Tracker'>(),
			trackers.at(1)?.id ?? anId<'Tracker'>()
		];
		const fern = expectOk(
			await app.addSubject.execute({
				trackerId: plants,
				name: 'Fern',
				fieldKeys: [],
				defaults: new Map()
			})
		);

		expect(
			expectErr(
				await app.addSubject.execute({
					trackerId: anId(),
					name: 'X',
					fieldKeys: [],
					defaults: new Map()
				})
			)
		).toBeInstanceOf(TrackerNotFound);
		expect(
			expectErr(
				await app.updateSubject.execute({
					id: anId(),
					name: 'X',
					fieldKeys: [],
					defaults: new Map()
				})
			)
		).toBeInstanceOf(SubjectNotFound);
		expect(
			expectErr(
				await app.logEntry.execute({
					trackerId: food,
					subjectId: fern.id,
					values: values(['calories', number(1)])
				})
			)
		).toBeInstanceOf(SubjectNotFound);
	});

	it('lists the entries about one thing', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.plants);
		const add = (name: string) =>
			app.addSubject.execute({ trackerId: tracker.id, name, fieldKeys: [], defaults: new Map() });
		const [fern, palm] = [expectOk(await add('Fern')), expectOk(await add('Palm'))];
		const watered = values(['watered', { type: FieldType.check }]);
		const fernEntry = expectOk(
			await app.logEntry.execute({ trackerId: tracker.id, subjectId: fern.id, values: watered })
		);
		expectOk(
			await app.logEntry.execute({ trackerId: tracker.id, subjectId: palm.id, values: watered })
		);

		expect(await app.listEntries.execute({ trackerId: tracker.id, subjectId: fern.id })).toEqual([
			fernEntry
		]);
	});
});
