import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import type {
	ProgressPhotoReader,
	ProgressPhotoWriter
} from '../domain/progress-photo-repository.ts';
import type { ProgressPhoto, ProgressPhotoId } from '../domain/progress-photo.ts';
import { deleteProgressPhoto, FIND_ALL_PROGRESS_PHOTOS, saveProgressPhoto } from './body.sql.ts';
import { progressPhotoMapper } from './progress-photo.mapper.ts';

/** Progress photos stored in the `progress_photo` table. */
export class SqliteProgressPhotoRepository implements ProgressPhotoReader, ProgressPhotoWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc ProgressPhotoReader.findAll} */
	async findAll(): Promise<readonly ProgressPhoto[]> {
		const rows = await this.database.query(FIND_ALL_PROGRESS_PHOTOS);
		return rows.map((row) => requireValidRow(progressPhotoMapper.toDomain(row)));
	}

	/** {@inheritDoc ProgressPhotoWriter.save} */
	async save(photo: ProgressPhoto): Promise<void> {
		await this.database.transaction([saveProgressPhoto(progressPhotoMapper.toRow(photo))]);
	}

	/** {@inheritDoc ProgressPhotoWriter.delete} */
	async delete(id: ProgressPhotoId): Promise<void> {
		await this.database.execute(deleteProgressPhoto(id));
	}
}
