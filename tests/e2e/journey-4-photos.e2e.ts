import path from 'node:path';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { checkIn, finishFirstRun, storedPhotoFiles } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');
const EXIF_HEADER = [...Buffer.from('Exif\0\0')];
const CAMERA_TAG = [...Buffer.from('BuffalogTestCam')];

function contains(bytes: readonly number[], sequence: readonly number[]): boolean {
	return bytes.some((_, start) => sequence.every((byte, offset) => bytes[start + offset] === byte));
}

test('check in with photos, find them stripped of GPS metadata, and compare them', async ({
	page,
	baseURL
}) => {
	const appOrigin = new URL(baseURL ?? '').origin;
	const foreignRequests: string[] = [];
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (url.protocol !== 'blob:' && url.protocol !== 'data:' && url.origin !== appOrigin) {
			foreignRequests.push(url.origin);
		}
	});
	await page.clock.setFixedTime(new Date('2026-10-01T09:00:00'));
	await finishFirstRun(page);
	await checkIn(page, '82', PHOTO);
	await page.clock.setFixedTime(new Date('2026-10-28T09:00:00'));
	await checkIn(page, '80', PHOTO);

	const files = await storedPhotoFiles(page);
	expect(files).toHaveLength(4);
	for (const file of files) {
		expect(file.bytes.length).toBeGreaterThan(0);
		expect(contains(file.bytes, EXIF_HEADER)).toBe(false);
		expect(contains(file.bytes, CAMERA_TAG)).toBe(false);
	}
	await expect(
		page.getByRole('img', { name: messages.checkIn.photoAlt('Oct 28', '80.0 kg') })
	).toBeVisible();
	await expect(
		page.getByRole('img', { name: messages.checkIn.photoAlt('Oct 1', '82.0 kg') })
	).toBeVisible();

	await page.getByRole('link', { name: messages.checkIn.compare }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('−2.0 kg');
	await expect(
		page.getByRole('img', { name: messages.checkIn.photoAlt('Oct 1', '82.0 kg') })
	).toBeVisible();
	await expect(
		page.getByRole('img', { name: messages.checkIn.photoAlt('Oct 28', '80.0 kg') })
	).toBeVisible();

	expect(foreignRequests).toEqual([]);
});
