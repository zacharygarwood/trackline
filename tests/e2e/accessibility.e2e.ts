import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { amountFields, finishFirstRun, homeRow, tab } from './helpers.ts';
import { eachScreen, settled } from './screens.ts';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Every WCAG 2.2 A and AA violation on the page, by rule and element. The page
 * is scrolled to the end first: at any other position, content passing under
 * the sticky tab bar counts as overlapping targets. That focused controls are
 * never hidden behind the bar is tested on its own below.
 */
async function violations(page: Page): Promise<string[]> {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.evaluate(() => {
		window.scrollTo(0, document.documentElement.scrollHeight);
	});
	const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
	return results.violations.flatMap((violation) =>
		violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`)
	);
}

test('onboarding meets WCAG 2.2 AA', async ({ page }) => {
	await page.goto('/app/welcome');
	const found = await violations(page);
	await page.getByRole('button', { name: /^Next/ }).click();
	found.push(...(await violations(page)));
	await page.getByRole('button', { name: messages.tracking.onboarding.next, exact: true }).click();
	found.push(...(await violations(page)));

	expect(found).toEqual([]);
});

for (const theme of [messages.preferences.themes.light, messages.preferences.themes.dark]) {
	test(`every screen meets WCAG 2.2 AA in the ${theme.toLowerCase()} theme`, async ({ page }) => {
		await finishFirstRun(page);
		await page.goto('/app/settings/theme');
		await page.getByRole('button', { name: theme, exact: true }).click();
		const found: string[] = [];
		await eachScreen(page, async (screen) => {
			found.push(...(await violations(page)).map((violation) => `${screen} ${violation}`));
		});
		expect(found).toEqual([]);
	});
}

test('every named theme meets WCAG 2.2 AA on Home and a tracker', async ({ page }) => {
	await finishFirstRun(page);
	const found: string[] = [];
	for (const theme of Object.values(messages.preferences.themes)) {
		await page.goto('/app/settings/theme');
		await page.getByRole('button', { name: theme, exact: true }).click();
		await page.goto('/app');
		await settled(page);
		found.push(...(await violations(page)).map((violation) => `${theme} Home ${violation}`));
		await homeRow(page, messages.tracking.templates.water).click();
		await settled(page);
		found.push(...(await violations(page)).map((violation) => `${theme} Water ${violation}`));
	}
	expect(found).toEqual([]);
});

test('the main flows work from the keyboard alone', async ({ page }) => {
	await finishFirstRun(page);
	await homeRow(page, messages.tracking.templates.water).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		messages.tracking.templates.water
	);
	await page.getByRole('button', { name: messages.tracking.page.log, exact: true }).focus();
	await page.keyboard.press('Enter');
	await amountFields(page).first().focus();
	await page.keyboard.type('2');
	await page.keyboard.press('Enter');
	await expect(page.getByRole('list', { name: messages.tracking.page.history })).toContainText(
		'2 glasses'
	);
	await tab(page, messages.navigation.stats).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.tracking.stats.title);
});

test('a focused control is never hidden behind the tab bar', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/settings/data');
	const control = page.getByRole('button', { name: messages.settings.exportBackup });
	await control.evaluate((element) => {
		const underTheTabBar = element.getBoundingClientRect().bottom - window.innerHeight + 8;
		window.scrollBy(0, underTheTabBar);
	});
	await control.focus();
	const onTop = await control.evaluate((element) => {
		const box = element.getBoundingClientRect();
		const topmost = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
		return topmost !== null && element.contains(topmost);
	});
	expect(onTop).toBe(true);
});
