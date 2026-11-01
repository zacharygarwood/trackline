import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect } from './fixtures.ts';

const onboarding = messages.tracking.onboarding;

/**
 * Goes through onboarding and lands on Home, with Workouts and Water picked
 * unless other templates are named.
 *
 * @param page - Any page.
 * @param picks - The template names to pick instead of the defaults.
 */
export async function finishFirstRun(page: Page, picks?: readonly string[]): Promise<void> {
	await page.goto('/app/welcome');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(onboarding.title);
	if (picks !== undefined) {
		for (const name of [messages.tracking.templates.workouts, messages.tracking.templates.water]) {
			await templateRow(page, name).click();
		}
		for (const name of picks) await templateRow(page, name).click();
	}
	await page.getByRole('button', { name: /^Next/ }).click();
	await page.getByRole('button', { name: onboarding.next, exact: true }).click();
	await page.getByRole('button', { name: onboarding.start }).click();
	await expectOnHome(page);
}

/**
 * A template to pick in onboarding or Add tracker, found by its name.
 *
 * @param page - The page.
 * @param name - The template's name, such as "Water".
 */
export function templateRow(page: Page, name: string) {
	return page.getByRole('button', { name: new RegExp(`^${name} `) });
}

/** Checks that Home, with its tracker rows and the Settings gear, is shown. */
export async function expectOnHome(page: Page): Promise<void> {
	await expect(page).toHaveURL(/\/app$/);
	await expect(
		page.getByRole('link', { name: messages.navigation.settings, exact: true })
	).toBeVisible();
}

/**
 * A tracker's row on Home.
 *
 * @param page - Home.
 * @param name - The tracker's name, such as "Water".
 */
export function homeRow(page: Page, name: string) {
	return page.getByRole('main').getByRole('button', { name: new RegExp(`^${name}( |$)`) });
}

/**
 * Opens a tracker's page from Home.
 *
 * @param page - Any page.
 * @param name - The tracker's name.
 */
export async function openTracker(page: Page, name: string): Promise<void> {
	await tab(page, messages.navigation.home).click();
	await homeRow(page, name).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
}

/**
 * Adds a tracker from Add tracker.
 *
 * @param page - Any page.
 * @param name - The template's name.
 */
export async function addTracker(page: Page, name: string): Promise<void> {
	await openAddTracker(page);
	await templateRow(page, name).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
}

/**
 * Opens Add tracker, which lives in Settings, under Trackers.
 *
 * @param page - Any page with the tab bar.
 */
export async function openAddTracker(page: Page): Promise<void> {
	await tab(page, messages.navigation.home).click();
	await page.getByRole('link', { name: messages.navigation.settings, exact: true }).click();
	await page.getByRole('link', { name: messages.navigation.trackers }).click();
	await page.getByRole('link', { name: messages.tracking.home.addTracker }).click();
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
 * Adds a photo on a photo tracker's page and saves it.
 *
 * @param page - The photo tracker's page.
 * @param photo - The photo file.
 */
export async function addPhoto(page: Page, photo: string): Promise<void> {
	const before = await page.getByRole('button', { name: /^Photo from / }).count();
	await page.getByRole('button', { name: messages.tracking.page.addPhoto }).click();
	await page.getByLabel(messages.tracking.inputs.takePhoto).setInputFiles(photo);
	await expect(page.getByLabel(messages.tracking.inputs.retakePhoto)).toBeAttached();
	const shots = page.getByRole('button', { name: /^Photo from / });
	await page.getByRole('button', { name: messages.tracking.page.save }).click();
	await expect(shots).toHaveCount(before + 1);
}
