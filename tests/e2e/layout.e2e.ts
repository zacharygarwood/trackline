import { expect, test } from './fixtures.ts';
import { finishFirstRun } from './helpers.ts';

const SCREENS = [
	'/',
	'/privacy',
	'/faq',
	'/app',
	'/app/train',
	'/app/eat',
	'/app/body',
	'/app/eat/today',
	'/app/train/exercises',
	'/app/train/start',
	'/app/train/workouts',
	'/app/eat/add',
	'/app/eat/foods',
	'/app/body/photos',
	'/app/body/compare',
	'/app/stats',
	'/app/train/history',
	'/app/eat/days',
	'/app/tracker',
	'/app/settings',
	'/app/settings/home',
	'/app/settings/theme',
	'/app/tracker/add',
	'/app/tracker',
	'/app/settings/tracking',
	'/app/settings/data',
	'/app/settings/support',
	'/app/settings/about',
	'/app/welcome'
];

test('no screen is wider than the phone', async ({ page }) => {
	await finishFirstRun(page);
	for (const screen of SCREENS) {
		await page.goto(screen);
		await page.waitForFunction(() => (document.querySelector('main')?.childElementCount ?? 0) > 0);
		const width = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(width, screen).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
	}
});
