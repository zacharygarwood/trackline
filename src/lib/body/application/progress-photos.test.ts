import { beforeEach, describe, expect, it } from 'vitest';
import { aProgressPhoto } from '../../../../tests/builders/progress-photo.builder.ts';
import { FakeImageProcessor } from '../../../../tests/fakes/fake-image-processor.ts';
import { InMemoryPhotoStore } from '../../../../tests/fakes/in-memory-photo-store.ts';
import { InMemoryProgressPhotoRepository } from '../../../../tests/fakes/in-memory-progress-photo-repository.ts';
import { SequentialIdGenerator } from '../../../../tests/fakes/sequential-id-generator.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Pose } from '../domain/pose.constants.ts';
import { AddProgressPhoto } from './add-progress-photo.ts';
import { DeleteProgressPhoto } from './delete-progress-photo.ts';
import { GetPhotoImage } from './get-photo-image.ts';
import { ListProgressPhotos } from './list-progress-photos.ts';
import { UnreadableImage } from './photo-ports.ts';
import { PhotoSize } from './photo-size.constants.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const image = Uint8Array.of(7, 8, 9);

describe('progress photo use cases', () => {
	let photos: InMemoryProgressPhotoRepository;
	let store: InMemoryPhotoStore;
	let add: AddProgressPhoto;

	beforeEach(() => {
		photos = new InMemoryProgressPhotoRepository();
		store = new InMemoryPhotoStore();
		add = new AddProgressPhoto({
			processor: new FakeImageProcessor(),
			store,
			photos,
			ids: new SequentialIdGenerator()
		});
	});

	it('stores the re-encoded image and thumbnail, then the photo with its size', async () => {
		const photo = expectOk(await add.execute({ date: date('2026-10-28'), pose: Pose.side, image }));

		expect(photo).toMatchObject({ pose: Pose.side, width: 3, height: 4 });
		expect(store.files.get(photo.id)).toEqual({
			full: Uint8Array.of(1, 7, 8, 9),
			thumbnail: Uint8Array.of(2, 7, 8, 9)
		});
		expect(await new ListProgressPhotos(photos).execute()).toEqual([photo]);
	});

	it('stores nothing when the file is not a readable image', async () => {
		expect(
			expectErr(
				await add.execute({ date: date('2026-10-28'), pose: Pose.front, image: new Uint8Array() })
			)
		).toBeInstanceOf(UnreadableImage);
		expect(store.files.size).toBe(0);
		expect(await photos.findAll()).toEqual([]);
	});

	it('lists photos newest first', async () => {
		const older = aProgressPhoto().on('2026-10-01').build();
		const newer = aProgressPhoto().on('2026-10-20').build();
		await photos.save(older);
		await photos.save(newer);

		expect(await new ListProgressPhotos(photos).execute()).toEqual([newer, older]);
	});

	it('reads either image of a photo', async () => {
		const photo = expectOk(await add.execute({ date: date('2026-10-28'), pose: Pose.back, image }));
		const read = new GetPhotoImage(store);

		expect(await read.execute({ id: photo.id, size: PhotoSize.thumbnail })).toEqual(
			Uint8Array.of(2, 7, 8, 9)
		);
		expect(await read.execute({ id: photo.id, size: PhotoSize.full })).toEqual(
			Uint8Array.of(1, 7, 8, 9)
		);
	});

	it('deletes a photo and both of its files', async () => {
		const photo = expectOk(await add.execute({ date: date('2026-10-28'), pose: Pose.back, image }));

		await new DeleteProgressPhoto(photos, store).execute({ id: photo.id });

		expect(await photos.findAll()).toEqual([]);
		expect(store.files.has(photo.id)).toBe(false);
	});
});
