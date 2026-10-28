import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { addPhoto, finishFirstRun, weighIn } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
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
	'/app/settings'
];

/**
 * Every WCAG 2.2 A and AA violation on the page, by rule and element. The page
 * is scrolled to the end first: at any other position, content passing under
 * the sticky tab bar counts as overlapping targets. That focused controls are
 * never hidden behind the bar is tested on its own below.
 */
async function violations(page: Page): Promise<string[]> {
	await page.evaluate(() => {
		window.scrollTo(0, document.documentElement.scrollHeight);
	});
	const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
	return results.violations.flatMap((violation) =>
		violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`)
	);
}

for (const colorScheme of ['light', 'dark'] as const) {
	test(`every screen meets WCAG 2.2 AA in the ${colorScheme} theme`, async ({ page }) => {
		await page.emulateMedia({ colorScheme });
		await finishFirstRun(page);
		await weighIn(page, '80.4');
		await addPhoto(page, PHOTO, messages.body.front);
		const found: string[] = [];
		for (const screen of SCREENS) {
			await page.goto(screen);
			await page.waitForFunction(
				() => (document.querySelector('main')?.childElementCount ?? 0) > 0
			);
			found.push(...(await violations(page)).map((violation) => `${screen} ${violation}`));
		}
		expect(found).toEqual([]);
	});
}

test('open sheets meet WCAG 2.2 AA', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/body');
	await page.getByRole('button', { name: messages.body.weighIn }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	const weighInSheet = await violations(page);
	await page.keyboard.press('Escape');

	await page.goto('/app/eat');
	await page.getByRole('button', { name: messages.nutrition.logFood }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	const logFoodSheet = await violations(page);

	expect([...weighInSheet, ...logFoodSheet]).toEqual([]);
});

test('the main flows work from the keyboard alone', async ({ page }) => {
	await finishFirstRun(page);
	const tabs = page.getByRole('navigation', { name: messages.navigation.tabs });

	await tabs.getByRole('link', { name: messages.navigation.body }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.body);

	const weighInButton = page.getByRole('button', { name: messages.body.weighIn });
	await weighInButton.focus();
	await expect(weighInButton).toBeFocused();
	await page.keyboard.press('Enter');
	const sheet = page.getByRole('dialog', { name: messages.body.weighIn });
	await expect(sheet).toBeVisible();
	for (const key of '80.4') {
		const name = key === '.' ? messages.design.decimalSeparator : key;
		await sheet.getByRole('button', { name, exact: true }).focus();
		await page.keyboard.press('Enter');
	}
	await sheet.getByRole('button', { name: messages.body.save }).focus();
	await page.keyboard.press('Enter');
	await expect(sheet).toBeHidden();
	await expect(page.getByRole('button', { name: /^Today, 80\.4 kg/ })).toBeVisible();

	await page.getByRole('button', { name: messages.body.weighIn }).click();
	await expect(sheet).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(sheet).toBeHidden();

	await tabs.getByRole('link', { name: messages.navigation.stats }).focus();
	await page.keyboard.press('Enter');
	const range = page.getByRole('radio', { name: messages.stats.all });
	await page.getByRole('radio', { name: messages.stats.fourWeeks }).focus();
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowRight');
	await expect(range).toBeChecked();
});

test('a focused control is never hidden behind the tab bar', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/body');
	await addPhoto(page, PHOTO, messages.body.front);
	const controls = [
		{ screen: '/app/body', control: page.getByRole('button', { name: messages.body.addPhoto }) },
		{
			screen: '/app/train',
			control: page.getByRole('button', { name: /^Mark .* as a rest day$/ }).last()
		}
	];
	for (const { screen, control } of controls) {
		await page.goto(screen);
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
		expect(onTop, screen).toBe(true);
	}
});
