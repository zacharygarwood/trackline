import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { checkIn, expectOnTab, finishFirstRun } from './helpers.ts';

const PHOTO = path.join(import.meta.dirname, 'assets', 'photo-with-gps.jpg');
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SCREENS = [
	'/',
	'/privacy',
	'/faq',
	'/app',
	'/app/train',
	'/app/train/new',
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
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.evaluate(() => {
		window.scrollTo(0, document.documentElement.scrollHeight);
	});
	const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
	return results.violations.flatMap((violation) =>
		violation.nodes.map((node) => `${violation.id}: ${node.target.join(' ')}`)
	);
}

/** Starts a workout of one new exercise and opens the workout screen. */
async function startWorkout(page: Page): Promise<void> {
	await page.goto('/app/train');
	await page.getByRole('searchbox', { name: messages.train.search }).fill('Squat');
	await page.getByRole('button', { name: messages.exercise.fields.weight, exact: true }).click();
	await page.getByRole('button', { name: messages.exercise.fields.reps, exact: true }).click();
	await page.getByRole('button', { name: messages.exercise.saveToLibrary }).click();
	await page.getByRole('button', { name: messages.train.startExercise('Squat') }).click();
	await expect(page.getByRole('button', { name: messages.workout.logSet })).toBeVisible();
}

for (const theme of [messages.preferences.themes.light, messages.preferences.themes.dark]) {
	test(`every screen meets WCAG 2.2 AA in the ${theme.toLowerCase()} theme`, async ({ page }) => {
		await finishFirstRun(page);
		await page.goto('/app/settings');
		await page.getByRole('button', { name: theme, exact: true }).click();
		await checkIn(page, '80.4', PHOTO);
		await startWorkout(page);
		const found: string[] = [];
		for (const screen of [...SCREENS, '/app/train/workout']) {
			await page.goto(screen);
			await page.waitForFunction(
				() => (document.querySelector('main')?.childElementCount ?? 0) > 0
			);
			found.push(...(await violations(page)).map((violation) => `${screen} ${violation}`));
		}
		expect(found).toEqual([]);
	});
}

test('the inline forms meet WCAG 2.2 AA', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/eat');
	await page.getByRole('searchbox', { name: messages.food.search }).fill('Mango');
	await expect(
		page.getByRole('heading', { name: messages.food.createTitle('Mango') })
	).toBeVisible();
	const newFood = await violations(page);

	await page.goto('/app/train');
	await page.getByRole('searchbox', { name: messages.train.search }).fill('Climb');
	await page.getByRole('button', { name: messages.exercise.fields.grade, exact: true }).click();
	const newExercise = await violations(page);

	expect([...newFood, ...newExercise]).toEqual([]);
});

test('the main flows work from the keyboard alone', async ({ page }) => {
	await finishFirstRun(page);
	const tabs = page.getByRole('navigation', { name: messages.navigation.tabs });

	await tabs.getByRole('link', { name: messages.navigation.body }).focus();
	await page.keyboard.press('Enter');
	await expectOnTab(page, messages.navigation.body);

	const field = page.getByRole('spinbutton', { name: messages.checkIn.weightIn('kg') });
	await field.focus();
	await page.keyboard.type('80.4');
	await page.getByRole('button', { name: messages.checkIn.checkIn }).focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('button', { name: messages.checkIn.update })).toBeVisible();

	await tabs.getByRole('link', { name: messages.navigation.stats }).focus();
	await page.keyboard.press('Enter');
	const all = page.getByRole('button', { name: messages.trends.ranges.all });
	await all.focus();
	await page.keyboard.press('Enter');
	await expect(all).toHaveAttribute('aria-pressed', 'true');
});

test('a focused control is never hidden behind the tab bar', async ({ page }) => {
	await finishFirstRun(page);
	await checkIn(page, '80.4');
	const controls = [
		{ screen: '/app/body', control: page.getByRole('button', { name: messages.checkIn.update }) },
		{
			screen: '/app/settings',
			control: page.getByRole('button', { name: messages.settings.exportBackup })
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
