import { expect, test } from './fixtures.ts';
import { finishFirstRun } from './helpers.ts';
import { eachScreen } from './screens.ts';

test('no screen is wider than the phone', async ({ page }) => {
	await finishFirstRun(page);
	await eachScreen(page, async (screen) => {
		const width = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(width, screen).toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
	});
});
