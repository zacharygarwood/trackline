import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { addPhoto, addTracker, finishFirstRun, storedPhotoFiles } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');
const THUMBNAIL = '.thumb';

test('add a body photo, kept as the original file next to a thumbnail', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, messages.tracking.templates.body_photos);
	await addPhoto(page, PHOTO);

	const files = await storedPhotoFiles(page);
	const full = files.find((file) => !file.name.endsWith(THUMBNAIL));
	const thumbnail = files.find((file) => file.name.endsWith(THUMBNAIL));
	expect(files).toHaveLength(2);
	expect(full?.bytes).toEqual([...(await readFile(PHOTO))]);
	expect(thumbnail?.bytes.length).toBeGreaterThan(0);
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
