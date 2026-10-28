import { beforeEach, describe, expect, it } from 'vitest';
import { FakeImageProcessor } from '../../../../tests/fakes/fake-image-processor.ts';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import { InMemoryPhotoStore } from '../../../../tests/fakes/in-memory-photo-store.ts';
import { InMemoryProgressPhotoRepository } from '../../../../tests/fakes/in-memory-progress-photo-repository.ts';
import { SequentialIdGenerator } from '../../../../tests/fakes/sequential-id-generator.ts';
import { AddProgressPhoto } from '../application/add-progress-photo.ts';
import { DeleteProgressPhoto } from '../application/delete-progress-photo.ts';
import { GetPhotoImage } from '../application/get-photo-image.ts';
import { ListProgressPhotos } from '../application/list-progress-photos.ts';
import { PhotoSize } from '../application/photo-size.constants.ts';
import { Pose } from '../domain/pose.constants.ts';
import type { ImageUrls } from './image-url-cache.ts';
import { PhotoGallery } from './photo-gallery.svelte.ts';

/** Hands out numbered fake URLs and remembers which were revoked. */
class FakeImageUrls implements ImageUrls {
	readonly created: Uint8Array[] = [];
	readonly revoked: string[] = [];

	create(bytes: Uint8Array): string {
		this.created.push(bytes);
		return `blob:${String(this.created.length)}`;
	}

	revoke(url: string): void {
		this.revoked.push(url);
	}
}

describe('PhotoGallery', () => {
	let store: InMemoryPhotoStore;
	let urls: FakeImageUrls;
	let gallery: PhotoGallery;
	const image = Uint8Array.of(5);

	beforeEach(async () => {
		const photos = new InMemoryProgressPhotoRepository();
		store = new InMemoryPhotoStore();
		urls = new FakeImageUrls();
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
			new FixedClock(0, '2026-10-28'),
			urls
		);
		await gallery.load();
	});

	it('adds a photo for a typed date and shows it', async () => {
		expect(await gallery.add(image, '2026-10-27', Pose.side)).toBeUndefined();

		expect(gallery.photos.map((photo) => [photo.date.toString(), photo.pose])).toEqual([
			['2026-10-27', Pose.side]
		]);
	});

	it('explains a file that is not an image', async () => {
		expect(await gallery.add(new Uint8Array(), '2026-10-28', Pose.front)).toBe(
			'That file is not a photo this device can open.'
		);
		expect(gallery.photos).toEqual([]);
	});

	it.each(['', 'yesterday', '2026-10-29'])('rejects the date %j', async (date) => {
		expect(await gallery.add(image, date, Pose.front)).toBe('Choose a date no later than today.');
		expect(store.files.size).toBe(0);
	});

	it('groups photos by date, newest first', async () => {
		await gallery.add(image, '2026-10-01', Pose.front);
		await gallery.add(image, '2026-10-20', Pose.front);
		await gallery.add(image, '2026-10-20', Pose.back);

		expect(
			gallery.days.map((day) => [day.date.toString(), day.photos.map((photo) => photo.pose)])
		).toEqual([
			['2026-10-20', [Pose.back, Pose.front]],
			['2026-10-01', [Pose.front]]
		]);
	});

	it('offers other photos of the same pose to compare with', async () => {
		await gallery.add(image, '2026-10-01', Pose.front);
		await gallery.add(image, '2026-10-10', Pose.side);
		await gallery.add(image, '2026-10-20', Pose.front);
		const [latest] = gallery.photos;
		if (latest === undefined) throw new Error('expected a photo');

		expect(gallery.comparableWith(latest).map((photo) => photo.date.toString())).toEqual([
			'2026-10-01'
		]);
	});

	it('loads each image once and frees the URLs when done', async () => {
		await gallery.add(image, '2026-10-28', Pose.front);
		const [photo] = gallery.photos;
		if (photo === undefined) throw new Error('expected a photo');

		const first = await gallery.imageUrl(photo, PhotoSize.thumbnail);
		const again = await gallery.imageUrl(photo, PhotoSize.thumbnail);
		await gallery.imageUrl(photo, PhotoSize.full);
		await gallery.dispose();

		expect(first).toBe('blob:1');
		expect(again).toBe(first);
		expect(urls.created).toEqual([Uint8Array.of(2, 5), Uint8Array.of(1, 5)]);
		expect(urls.revoked).toEqual(['blob:1', 'blob:2']);
	});

	it('removes a photo and its image', async () => {
		await gallery.add(image, '2026-10-28', Pose.front);
		const [photo] = gallery.photos;
		if (photo === undefined) throw new Error('expected a photo');

		await gallery.remove(photo);

		expect(gallery.photos).toEqual([]);
		expect(store.files.size).toBe(0);
	});
});
