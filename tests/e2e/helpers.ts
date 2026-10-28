import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect } from './fixtures.ts';

/** Goes through the first-run screen with the defaults and lands on Today. */
export async function finishFirstRun(page: Page): Promise<void> {
	await page.goto('/app/welcome');
	await page.getByRole('button', { name: messages.welcome.start }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.today);
}

/**
 * Types an entry on the open sheet's number pad.
 *
 * @param page - The page with an open sheet.
 * @param entry - Digits and at most one decimal point, for example "80.4".
 */
export async function typeOnNumberPad(page: Page, entry: string): Promise<void> {
	const sheet = page.getByRole('dialog');
	for (const key of entry) {
		const name = key === '.' ? messages.design.decimalSeparator : key;
		await sheet.getByRole('button', { name, exact: true }).click();
	}
}

/** Records a weigh-in for the current day from the Body tab. */
export async function weighIn(page: Page, entry: string): Promise<void> {
	await page.goto('/app/body');
	await page.getByRole('button', { name: messages.body.weighIn }).click();
	await typeOnNumberPad(page, entry);
	await page.getByRole('dialog').getByRole('button', { name: messages.body.save }).click();
	await expect(page.getByRole('dialog')).toBeHidden();
}

/** A photo file as stored on the device. */
export interface StoredPhotoFile {
	readonly name: string;
	readonly bytes: readonly number[];
}

/** Reads every file in the app's OPFS photo folder. */
export async function storedPhotoFiles(page: Page): Promise<readonly StoredPhotoFile[]> {
	return page.evaluate(async () => {
		const root = await navigator.storage.getDirectory();
		const folder = await root.getDirectoryHandle('photos', { create: true });
		const files: StoredPhotoFile[] = [];
		for await (const handle of folder.values()) {
			if (handle instanceof FileSystemFileHandle) {
				const bytes = new Uint8Array(await (await handle.getFile()).arrayBuffer());
				files.push({ name: handle.name, bytes: [...bytes] });
			}
		}
		return files;
	});
}

/**
 * Adds a progress photo from the Body tab or the gallery: Add photo, pick the
 * file, optionally change the date, then tap the pose.
 */
export async function addPhoto(
	page: Page,
	file: string,
	pose: string,
	date?: string
): Promise<void> {
	const chooser = page.waitForEvent('filechooser');
	await page.getByRole('button', { name: messages.body.addPhoto }).click();
	await (await chooser).setFiles(file);
	const sheet = page.getByRole('dialog', { name: messages.body.addPhoto });
	if (date !== undefined) await sheet.getByLabel(messages.body.photoDate).fill(date);
	await sheet.getByRole('button', { name: pose, exact: true }).click();
	await expect(sheet).toBeHidden();
}
