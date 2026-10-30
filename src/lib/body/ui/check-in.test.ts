import { beforeEach, describe, expect, it } from 'vitest';
import { FakeImageProcessor } from '../../../../tests/fakes/fake-image-processor.ts';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { InMemoryMassUnitPreference } from '../../../../tests/fakes/in-memory-mass-unit-preference.ts';
import { InMemoryPhotoStore } from '../../../../tests/fakes/in-memory-photo-store.ts';
import { InMemoryProgressPhotoRepository } from '../../../../tests/fakes/in-memory-progress-photo-repository.ts';
import { InMemoryWeighInRepository } from '../../../../tests/fakes/in-memory-weigh-in-repository.ts';
import { InMemoryWeightGoalRepository } from '../../../../tests/fakes/in-memory-weight-goal-repository.ts';
import { SequentialIdGenerator } from '../../../../tests/fakes/sequential-id-generator.ts';
import { GetMassUnit } from '../../settings/application/get-mass-unit.ts';
import { AddProgressPhoto } from '../application/add-progress-photo.ts';
import { DeleteProgressPhoto } from '../application/delete-progress-photo.ts';
import { DeleteWeighIn } from '../application/delete-weigh-in.ts';
import { GetPhotoImage } from '../application/get-photo-image.ts';
import { GetWeightGoal } from '../application/get-weight-goal.ts';
import { ListProgressPhotos } from '../application/list-progress-photos.ts';
import { ListWeighIns } from '../application/list-weigh-ins.ts';
import { RecordWeighIn } from '../application/record-weigh-in.ts';
import { BodyScreen } from './body-screen.svelte.ts';
import { CheckIn } from './check-in.svelte.ts';
import { PhotoGallery } from './photo-gallery.svelte.ts';

describe('CheckIn', () => {
	let body: BodyScreen;
	let gallery: PhotoGallery;
	let checkIn: CheckIn;

	beforeEach(async () => {
		const clock = new FixedClock(0, '2026-10-29');
		const weighIns = new InMemoryWeighInRepository();
		const photos = new InMemoryProgressPhotoRepository();
		const store = new InMemoryPhotoStore();
		body = new BodyScreen(
			{
				listWeighIns: new ListWeighIns(weighIns),
				recordWeighIn: new RecordWeighIn(weighIns, new SequentialIdGenerator()),
				deleteWeighIn: new DeleteWeighIn(weighIns),
				getWeightGoal: new GetWeightGoal(new InMemoryWeightGoalRepository()),
				getMassUnit: new GetMassUnit(new InMemoryMassUnitPreference())
			},
			clock
		);
		gallery = new PhotoGallery(
			{
				listProgressPhotos: new ListProgressPhotos(photos),
				addProgressPhoto: new AddProgressPhoto({
					processor: new FakeImageProcessor(),
					store,
					photos,
					ids: new SequentialIdGenerator()
				}),
				deleteProgressPhoto: new DeleteProgressPhoto(photos, store),
				getPhotoImage: new GetPhotoImage(store)
			},
			clock,
			{ create: () => 'blob:1', revoke: (url: string) => url.length }
		);
		await Promise.all([body.load(), gallery.load()]);
		checkIn = new CheckIn(body, gallery);
	});

	it('checks in a weight and a photo for today, then undoes it', async () => {
		checkIn.weight = '82.3';
		checkIn.step(1);
		checkIn.photo = Uint8Array.of(1);

		const result = await checkIn.save();

		expect(result?.message).toBe('Checked in');
		expect(checkIn.todays?.weight.kilograms).toBeCloseTo(82.4);
		expect(gallery.photos).toHaveLength(1);
		await result?.undo();
		expect(checkIn.todays).toBeUndefined();
		expect(gallery.photos).toEqual([]);
	});

	it('updates today and undoes back to the earlier weight', async () => {
		checkIn.weight = '80';
		await checkIn.save();
		checkIn.prefill();
		expect(checkIn.weight).toBe('80.0');
		checkIn.weight = '79.5';

		const result = await checkIn.save();

		expect(result?.message).toBe('Updated');
		await result?.undo();
		expect(checkIn.todays?.weight.kilograms).toBe(80);
	});

	it('asks to check a number it cannot use, and does nothing when empty', async () => {
		checkIn.weight = '2000';
		expect(await checkIn.save()).toBeUndefined();
		expect(checkIn.problem).toBe('Check the number');

		checkIn.weight = ' ';
		expect(await checkIn.save()).toBeUndefined();
	});
});
