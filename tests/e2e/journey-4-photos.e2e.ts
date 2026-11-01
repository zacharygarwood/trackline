import path from 'node:path';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { addPhoto, addTracker, finishFirstRun, storedPhotoFiles } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');
const EXIF_HEADER = [...Buffer.from('Exif\0\0')];
const CAMERA_TAG = [...Buffer.from('BuffalogTestCam')];

function contains(bytes: readonly number[], sequence: readonly number[]): boolean {
	return bytes.some((_, start) => sequence.every((byte, offset) => bytes[start + offset] === byte));
}

test('add body photos, find them stripped of GPS metadata, and compare them', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, messages.tracking.templates.body_photos);
	await addPhoto(page, PHOTO);

	const files = await storedPhotoFiles(page);
	expect(files).toHaveLength(2);
	for (const file of files) {
		expect(file.bytes.length).toBeGreaterThan(0);
		expect(contains(file.bytes, EXIF_HEADER)).toBe(false);
		expect(contains(file.bytes, CAMERA_TAG)).toBe(false);
	}
});

test('compare the oldest and newest photo', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, messages.tracking.templates.body_photos);
	await addPhoto(page, PHOTO);
	await addPhoto(page, PHOTO);

	await page.getByRole('button', { name: messages.tracking.page.compare }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.tracking.compare.title);
	await expect(page.getByRole('img')).toHaveCount(2);
});
