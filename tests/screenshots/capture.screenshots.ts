import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from '../e2e/fixtures.ts';
import { finishFirstRun, openTracker } from '../e2e/helpers.ts';
import { demoBackup, DEMO_TODAY } from './demo-backup.ts';

const OUTPUT = 'static/screenshots';
const SCREENS = [
	{ name: 'today', path: '/app', ready: messages.tracking.templates.water },
	{ name: 'stats', path: '/app/stats', ready: messages.tracking.templates.sleep }
] as const;
const { templates, page: trackerPage, library } = messages.tracking;
const logButton = (page: Page) => page.getByRole('button', { name: trackerPage.log, exact: true });
/** Each template page's tracker, and the button on its page that opens the second screenshot. */
const TRACKERS = [
	{
		name: 'workouts',
		tracker: templates.workouts,
		detail: (page: Page) => page.getByRole('button', { name: /^Yesterday/ })
	},
	{
		name: 'food',
		tracker: templates.food,
		detail: (page: Page) => page.getByRole('button', { name: library.foods })
	},
	{ name: 'water', tracker: templates.water, detail: logButton },
	{ name: 'sleep', tracker: templates.sleep, detail: logButton },
	{ name: 'weight', tracker: templates.weight, detail: logButton },
	{ name: 'steps', tracker: templates.steps, detail: logButton }
] as const;

async function capture(page: Page, name: string): Promise<void> {
	await page.mouse.move(0, 0);
	await page.waitForFunction(() => document.getAnimations().length === 0);
	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await page.screenshot({ path: `${OUTPUT}/${name}.jpg`, type: 'jpeg', quality: 82 });
}

test('capture the site screenshots', async ({ page }) => {
	await page.clock.setFixedTime(new Date(`${DEMO_TODAY}T12:30:00`));
	await finishFirstRun(page);
	await page.goto('/app/settings/data');
	await page.locator('input[type="file"]').setInputFiles({
		name: 'demo.zip',
		mimeType: 'application/zip',
		buffer: Buffer.from(await demoBackup())
	});
	const reloaded = page.waitForEvent('load');
	await page
		.getByRole('dialog', { name: messages.settings.restoreTitle })
		.getByRole('button', { name: messages.settings.restoreConfirm })
		.click();
	await reloaded;

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/app/settings/theme');
	const light = page.getByRole('button', { name: messages.preferences.themes.light, exact: true });
	await expect(async () => {
		await light.click();
		await page.reload();
		await expect(light).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
	}).toPass();

	for (const screen of SCREENS) {
		await page.goto(screen.path);
		await expect(page.getByText(screen.ready).first()).toBeVisible();
		await capture(page, screen.name);
	}
	for (const screen of TRACKERS) {
		await openTracker(page, screen.tracker);
		await capture(page, screen.name);
		const trackerUrl = page.url();
		await screen.detail(page).first().click();
		await page.waitForURL((url) => url.href !== trackerUrl);
		await capture(page, `${screen.name}-detail`);
	}
});
