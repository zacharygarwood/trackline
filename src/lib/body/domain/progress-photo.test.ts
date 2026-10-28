import { describe, expect, it } from 'vitest';
import { aProgressPhotoId } from '../../../../tests/builders/progress-photo.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Pose } from './pose.constants.ts';
import { createProgressPhoto, InvalidPhotoSize } from './progress-photo.ts';

const today = expectOk(LocalDate.parse('2026-10-28'));

describe('createProgressPhoto', () => {
	it('records a photo of a pose on a date with its size', () => {
		const photo = expectOk(
			createProgressPhoto({
				id: aProgressPhotoId(),
				date: today,
				pose: Pose.side,
				width: 1536,
				height: 2048
			})
		);

		expect(photo).toMatchObject({ pose: Pose.side, width: 1536, height: 2048 });
		expect(photo.date.equals(today)).toBe(true);
	});

	it.each([
		[0, 100],
		[100, 0],
		[1.5, 100],
		[100, -1]
	])('rejects %d × %d as an image size', (width, height) => {
		expect(
			expectErr(
				createProgressPhoto({
					id: aProgressPhotoId(),
					date: today,
					pose: Pose.front,
					width,
					height
				})
			)
		).toBeInstanceOf(InvalidPhotoSize);
	});
});
