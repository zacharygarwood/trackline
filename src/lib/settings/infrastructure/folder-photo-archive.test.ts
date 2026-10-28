import { describe, expect, it } from 'vitest';
import { InMemoryPhotoFolder } from '../../../../tests/fakes/in-memory-photo-folder.ts';
import { FolderPhotoArchive } from './folder-photo-archive.ts';

describe('FolderPhotoArchive', () => {
	const photo = { name: 'a', bytes: Uint8Array.of(1) };

	it('exports every photo file', async () => {
		const folder = new InMemoryPhotoFolder();
		await folder.write([photo]);

		expect(await new FolderPhotoArchive(folder).exportFiles()).toEqual([photo]);
	});

	it('replaces all photo files with a backup', async () => {
		const folder = new InMemoryPhotoFolder();
		await folder.write([{ name: 'old', bytes: Uint8Array.of(9) }]);

		await new FolderPhotoArchive(folder).replaceFiles([photo]);

		expect(await folder.readAll()).toEqual([photo]);
	});

	it('wipes every photo file', async () => {
		const folder = new InMemoryPhotoFolder();
		await folder.write([photo]);

		await new FolderPhotoArchive(folder).wipe();

		expect(await folder.readAll()).toEqual([]);
	});
});
