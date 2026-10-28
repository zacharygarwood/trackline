import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { err, type Result } from '../../shared/result.ts';
import { Pose } from '../domain/pose.constants.ts';
import { createProgressPhoto, type ProgressPhoto } from '../domain/progress-photo.ts';
import { BodyTable } from './body.sql.ts';
import type { ProgressPhotoRow } from './progress-photo.row.ts';

const corrupt = (reason: string) => err(new CorruptRow(BodyTable.progressPhoto, reason));

const isPose = (value: string): value is Pose => Object.values<string>(Pose).includes(value);

function readColumns(row: SqlRow): ProgressPhotoRow | undefined {
	const { id, date, pose, width, height } = row;
	return typeof id === 'string' &&
		typeof date === 'string' &&
		typeof pose === 'string' &&
		typeof width === 'number' &&
		typeof height === 'number'
		? { id, date, pose, width, height }
		: undefined;
}

/** Converts between progress photos and `progress_photo` rows. */
export const progressPhotoMapper = {
	/**
	 * Validates a stored row and builds the photo it describes.
	 *
	 * @param row - A row selected with the columns of {@link ProgressPhotoRow}.
	 */
	toDomain(row: SqlRow): Result<ProgressPhoto, CorruptRow> {
		const columns = readColumns(row);
		if (columns === undefined) return corrupt(CorruptReason.missingColumn);
		const { id, date, pose, width, height } = columns;
		const parsedId = parseId<'ProgressPhoto'>(id);
		const parsedDate = LocalDate.parse(date);
		if (!parsedId.ok || !parsedDate.ok || !isPose(pose)) {
			return corrupt(CorruptReason.invalidValue);
		}
		const photo = createProgressPhoto({
			id: parsedId.value,
			date: parsedDate.value,
			pose,
			width,
			height
		});
		return photo.ok ? photo : corrupt(CorruptReason.brokenInvariant);
	},

	/** @param photo - The photo to store. */
	toRow(photo: ProgressPhoto): ProgressPhotoRow {
		return {
			id: photo.id,
			date: photo.date.toString(),
			pose: photo.pose,
			width: photo.width,
			height: photo.height
		};
	}
};
