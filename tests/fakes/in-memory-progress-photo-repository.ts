import type {
	ProgressPhotoReader,
	ProgressPhotoWriter
} from '../../src/lib/body/domain/progress-photo-repository.ts';
import type { ProgressPhoto, ProgressPhotoId } from '../../src/lib/body/domain/progress-photo.ts';

/** Progress photos kept in a map; passes the same contract suite as the SQLite repository. */
export class InMemoryProgressPhotoRepository implements ProgressPhotoReader, ProgressPhotoWriter {
	private readonly photos = new Map<ProgressPhotoId, ProgressPhoto>();

	findAll(): Promise<readonly ProgressPhoto[]> {
		return Promise.resolve(
			[...this.photos.values()].toSorted((a, b) => {
				const byDate = b.date.compareTo(a.date);
				return byDate === 0 ? b.id.localeCompare(a.id) : byDate;
			})
		);
	}

	save(photo: ProgressPhoto): Promise<void> {
		this.photos.set(photo.id, photo);
		return Promise.resolve();
	}

	delete(id: ProgressPhotoId): Promise<void> {
		this.photos.delete(id);
		return Promise.resolve();
	}
}
