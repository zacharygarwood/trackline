import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from '../e2e/fixtures.ts';
import { finishFirstRun } from '../e2e/helpers.ts';
import { demoBackup, DEMO_TODAY } from './demo-backup.ts';

const OUTPUT = 'static/screenshots';
const SCREENS = [
	{ name: 'today', path: '/app', ready: messages.training.lastSevenDays },
	{ name: 'stats', path: '/app/stats', ready: messages.stats.currentStreak }
] as const;

test('capture the landing page screenshots', async ({ page }) => {
	await page.clock.setFixedTime(new Date(`${DEMO_TODAY}T12:30:00`));
	await finishFirstRun(page);
	await page.goto('/app/settings');
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

	for (const scheme of ['light', 'dark'] as const) {
		await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
		for (const screen of SCREENS) {
			await page.goto(screen.path);
			await expect(page.getByText(screen.ready).first()).toBeVisible();
			await page.screenshot({
				path: `${OUTPUT}/${screen.name}-${scheme}.jpg`,
				type: 'jpeg',
				quality: 82
			});
		}
	}
});
