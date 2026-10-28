import { messages } from '../../src/lib/i18n/messages.en.ts';
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
	'/app/body/photos',
	'/app/stats',
	'/app/settings',
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
	await expect(page.getByRole('navigation', { name: messages.navigation.tabs })).toBeHidden();
});
