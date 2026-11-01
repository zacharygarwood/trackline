import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from '../e2e/fixtures.ts';
import { finishFirstRun } from '../e2e/helpers.ts';
import { demoBackup, DEMO_TODAY } from './demo-backup.ts';

const OUTPUT = 'static/screenshots';
const SCREENS = [
	{ name: 'today', path: '/app', ready: messages.tracking.templates.water },
	{ name: 'stats', path: '/app/stats', ready: messages.tracking.templates.sleep }
] as const;

test('capture the landing page screenshots', async ({ page }) => {
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
	const themes = {
		light: messages.preferences.themes.light,
		dark: messages.preferences.themes.dark
	};
	for (const [scheme, theme] of Object.entries(themes)) {
		await page.goto('/app/settings/theme');
		const choice = page.getByRole('button', { name: theme, exact: true });
		await choice.click();
		await expect(choice).toHaveAttribute('aria-pressed', 'true');
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
