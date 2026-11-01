import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { InMemoryPhotoFolder } from '../../../../tests/fakes/in-memory-photo-folder.ts';
import { PhotoSize } from '../application/photo-size.constants.ts';
import { FolderPhotoStore } from './folder-photo-store.ts';

describe('FolderPhotoStore', () => {
	const files = { full: Uint8Array.of(1), thumbnail: Uint8Array.of(2) };

	it('keeps a photo as a full file and a thumbnail file named by its id', async () => {
		const folder = new InMemoryPhotoFolder();
		const id = anId<'Photo'>();

		await new FolderPhotoStore(folder).put(id, files);

		expect([...folder.files.keys()]).toEqual([id, `${id}.thumb`]);
	});

	it('reads back either size, and nothing for an unknown photo', async () => {
		const store = new FolderPhotoStore(new InMemoryPhotoFolder());
		const id = anId<'Photo'>();
		await store.put(id, files);

		expect(await store.read(id, PhotoSize.full)).toEqual(files.full);
		expect(await store.read(id, PhotoSize.thumbnail)).toEqual(files.thumbnail);
		expect(await store.read(anId<'Photo'>(), PhotoSize.full)).toBeUndefined();
	});

	it('deletes both files', async () => {
		const folder = new InMemoryPhotoFolder();
		const store = new FolderPhotoStore(folder);
		const kept = anId<'Photo'>();
		const deleted = anId<'Photo'>();
		await store.put(kept, files);
		await store.put(deleted, files);

		await store.delete(deleted);

		expect([...folder.files.keys()]).toEqual([kept, `${kept}.thumb`]);
	});
});
