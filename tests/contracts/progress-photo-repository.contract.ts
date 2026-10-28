import { describe, expect, it } from 'vitest';
import { Pose } from '../../src/lib/body/domain/pose.constants.ts';
import type {
	ProgressPhotoReader,
	ProgressPhotoWriter
} from '../../src/lib/body/domain/progress-photo-repository.ts';
import { aProgressPhoto } from '../builders/progress-photo.builder.ts';

type ProgressPhotoRepository = ProgressPhotoReader & ProgressPhotoWriter;

/**
 * The behavior every progress photo repository must have, run against both
 * the in-memory fake and the SQLite implementation so the fake stays honest.
 */
export function describeProgressPhotoRepository(
	create: () => Promise<ProgressPhotoRepository>
): void {
	describe('progress photo repository contract', () => {
		it('returns a saved photo with all its fields', async () => {
			const repository = await create();
			const photo = aProgressPhoto().on('2026-10-27').posing(Pose.side).build();

			await repository.save(photo);

			expect(await repository.findAll()).toEqual([photo]);
		});

		it('lists photos newest date first, keeping several photos of a day', async () => {
			const repository = await create();
			const older = aProgressPhoto().on('2026-10-01').build();
			const front = aProgressPhoto().on('2026-10-03').posing(Pose.front).build();
			const back = aProgressPhoto().on('2026-10-03').posing(Pose.back).build();
			for (const photo of [older, front, back]) await repository.save(photo);

			const found = await repository.findAll();

			expect(found.map((photo) => photo.date.toString())).toEqual([
				'2026-10-03',
				'2026-10-03',
				'2026-10-01'
			]);
			expect(found).toHaveLength(3);
		});

		it('deletes a photo', async () => {
			const repository = await create();
			const kept = aProgressPhoto().build();
			const deleted = aProgressPhoto().build();
			await repository.save(kept);
			await repository.save(deleted);

			await repository.delete(deleted.id);
			await repository.delete(deleted.id);

			expect(await repository.findAll()).toEqual([kept]);
		});
	});
}
