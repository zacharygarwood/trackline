import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect } from './fixtures.ts';

/** Goes through the first-run screen with the defaults and lands on Home. */
export async function finishFirstRun(page: Page): Promise<void> {
	await page.goto('/app/welcome');
	await page.getByRole('button', { name: messages.welcome.start }).click();
	await expectOnHome(page);
}

/** Checks that Home, with its progress bars and the Settings gear, is shown. */
export async function expectOnHome(page: Page): Promise<void> {
	await expect(page).toHaveURL(/\/app$/);
	await expect(
		page.getByRole('link', { name: messages.navigation.settings, exact: true })
	).toBeVisible();
}

/**
 * A progress bar on Home, found by its label.
 *
 * @param page - Home.
 * @param label - The bar's label, such as "Calories".
 */
export function homeBar(page: Page, label: string) {
	return page.getByRole('main').getByRole('button', { name: new RegExp(`^${label}`) });
}

/**
 * A link in the tab bar.
 *
 * @param page - Any page with the tab bar.
 * @param label - The tab's label, such as "Home".
 */
export function tab(page: Page, label: string) {
	return page
		.getByRole('navigation', { name: messages.navigation.tabs })
		.getByRole('link', { name: label, exact: true });
}

/**
 * Checks in from the Weight page: types today's weight, optionally adds a photo, and saves.
 *
 * @param page - Any page of the app.
 * @param entry - The weight as typed, for example "80.4"; empty to leave it.
 * @param photo - A photo file to add, if any.
 */
export async function checkIn(page: Page, entry: string, photo?: string): Promise<void> {
	await page.goto('/app/body');
	const field = page.getByRole('spinbutton', { name: /^Weight, / });
	await field.fill(entry);
	if (photo !== undefined) {
		await page.getByLabel(messages.checkIn.takePhoto).setInputFiles(photo);
	}
	const save = page.getByRole('button', {
		name: new RegExp(`^(${messages.checkIn.checkIn}|${messages.checkIn.update})$`)
	});
	await save.click();
	await expect(
		page
			.getByText(new RegExp(`^(${messages.checkIn.checkedIn}|${messages.checkIn.updated})$`))
			.first()
	).toBeVisible();
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
