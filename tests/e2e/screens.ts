import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect } from './fixtures.ts';
import { addTracker, openTracker } from './helpers.ts';

/** Screens that open from their address alone. */
export const ADDRESSED_SCREENS = [
	'/',
	'/privacy',
	'/faq',
	'/app',
	'/app/stats',
	'/app/add',
	'/app/settings',
	'/app/settings/trackers',
	'/app/settings/theme',
	'/app/settings/units',
	'/app/settings/data',
	'/app/settings/support',
	'/app/settings/about'
];

/** Waits for a page's content after opening it. */
export async function settled(page: Page): Promise<void> {
	await page.waitForFunction(() => (document.querySelector('main')?.childElementCount ?? 0) > 0);
}

/**
 * Visits every addressed screen, then walks to the pages that need page state,
 * running a check on each.
 *
 * @param page - A page past onboarding.
 * @param check - Runs on each screen, given its name.
 */
export async function eachScreen(
	page: Page,
	check: (name: string) => Promise<void>
): Promise<void> {
	for (const screen of ADDRESSED_SCREENS) {
		await page.goto(screen);
		await settled(page);
		await check(screen);
	}
	const { templates, page: trackerPage, workout, food } = messages.tracking;
	await openTracker(page, templates.water);
	await check('water');
	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	await expect(page.getByRole('button', { name: trackerPage.save })).toBeVisible();
	await check('water log');
	await page.goBack();
	await page.getByRole('button', { name: trackerPage.editTracker }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(trackerPage.editTracker);
	await check('edit tracker');

	await openTracker(page, templates.workouts);
	await check('workouts');
	await page.getByRole('button', { name: workout.start }).click();
	await page.getByRole('button', { name: workout.addExercise }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(workout.chooseExercise);
	await check('add exercise');
	await page.getByRole('button', { name: messages.tracking.starters.squat }).click();
	await expect(page.getByRole('heading', { name: messages.tracking.starters.squat })).toBeVisible();
	await check('workout');

	await addTracker(page, templates.food);
	await check('food');
	await page.getByRole('button', { name: food.add }).click();
	await expect(page.getByRole('searchbox')).toBeVisible();
	await check('add food');
	await page.getByRole('button', { name: food.quickAdd }).click();
	await expect(page.getByRole('button', { name: trackerPage.save })).toBeVisible();
	await check('quick add');
}
