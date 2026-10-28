import path from 'node:path';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { addPhoto, finishFirstRun, storedPhotoFiles } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');
const EXIF_HEADER = [...Buffer.from('Exif\0\0')];
const CAMERA_TAG = [...Buffer.from('BuffalogTestCam')];

function contains(bytes: readonly number[], sequence: readonly number[]): boolean {
	return bytes.some((_, start) => sequence.every((byte, offset) => bytes[start + offset] === byte));
}

test('add progress photos, find them stripped of GPS metadata, and compare them', async ({
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
	await page.clock.setFixedTime(new Date('2026-10-28T09:00:00'));
	await finishFirstRun(page);

	await page.getByRole('link', { name: messages.navigation.body }).click();
	await addPhoto(page, PHOTO, messages.body.front);
	await expect(
		page.getByRole('button', { name: messages.body.photoOf(messages.body.front, 'Today') })
	).toBeVisible();

	const files = await storedPhotoFiles(page);
	expect(files).toHaveLength(2);
	for (const file of files) {
		expect(file.bytes.length).toBeGreaterThan(0);
		expect(contains(file.bytes, EXIF_HEADER)).toBe(false);
		expect(contains(file.bytes, CAMERA_TAG)).toBe(false);
	}

	await page.getByRole('link', { name: messages.body.allPhotos }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.body.progressPhotos);
	await addPhoto(page, PHOTO, messages.body.front, '2026-10-01');
	await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();

	await page
		.getByRole('button', { name: messages.body.photoOf(messages.body.front, 'Today') })
		.click();
	const sheet = page.getByRole('dialog');
	await expect(sheet.getByRole('img', { name: 'Front, Today' })).toBeVisible();
	await sheet.getByRole('button', { name: messages.body.compare }).click();
	await sheet.getByRole('button', { name: /^Front, / }).click();
	await expect(
		sheet.getByRole('img', { name: /^Front, .* compared with Front, Today$/ })
	).toHaveCount(0);
	await sheet.getByText(messages.body.slider).click();
	await expect(
		sheet.getByRole('img', { name: /^Front, .* compared with Front, Today$/ })
	).toBeVisible();
	await sheet.getByRole('slider', { name: messages.body.comparePosition }).fill('80');

	expect(foreignRequests).toEqual([]);
});
