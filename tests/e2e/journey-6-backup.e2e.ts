import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import path from 'node:path';
import { addPhoto, addTracker, finishFirstRun, homeRow, storedPhotoFiles } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');

test('export a backup, delete all data, and restore everything, photos included, from the backup', async ({
	page
}, testInfo) => {
	await finishFirstRun(page);
	await addTracker(page, messages.tracking.templates.body_photos);
	await addPhoto(page, PHOTO);

	await page.goto('/app/settings/data');
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: messages.settings.exportBackup }).click();
	const backup = await download;
	expect(backup.suggestedFilename()).toMatch(/^trackline-backup-\d{4}-\d{2}-\d{2}\.zip$/);
	const backupPath = testInfo.outputPath('backup.zip');
	await backup.saveAs(backupPath);
	await expect(page.getByText(messages.settings.lastBackup)).toBeVisible();
	await expect(page.getByText(messages.settings.never)).toBeHidden();

	await page.getByRole('button', { name: messages.settings.deleteAll }).click();
	const deleteSheet = page.getByRole('dialog', { name: messages.settings.deleteTitle });
	await expect(deleteSheet).toContainText('(3 trackers, 1 entry, 1 photo)');
	const confirm = deleteSheet.getByRole('button', { name: messages.settings.deleteConfirm });
	await expect(confirm).toBeDisabled();
	await deleteSheet.getByRole('textbox').fill(messages.settings.deleteConfirmWord);
	await confirm.click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		messages.tracking.onboarding.title
	);
	await finishFirstRun(page);
	await expect(homeRow(page, messages.tracking.templates.body_photos)).toBeHidden();
	expect(await storedPhotoFiles(page)).toEqual([]);

	await page.goto('/app/settings/data');
	await page.locator('input[type="file"]').setInputFiles(backupPath);
	const restoreSheet = page.getByRole('dialog', { name: messages.settings.restoreTitle });
	await expect(restoreSheet).toContainText('(2 trackers, 0 entries, 0 photos)');
	const reloaded = page.waitForEvent('load');
	await restoreSheet.getByRole('button', { name: messages.settings.restoreConfirm }).click();
	await reloaded;

	await page.goto('/app');
	await homeRow(page, messages.tracking.templates.body_photos).click();
	await expect(page.getByRole('button', { name: /^Photo from / })).toHaveCount(1);
	expect(await storedPhotoFiles(page)).toHaveLength(2);
});

test('a file that is not a backup is refused without changing anything', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/settings/data');

	await page.locator('input[type="file"]').setInputFiles({
		name: 'notes.zip',
		mimeType: 'application/zip',
		buffer: Buffer.from('not a zip')
	});

	await expect(page.getByRole('alert')).toHaveText(messages.settings.notABackup);
	await expect(page.getByRole('dialog')).toBeHidden();
});
