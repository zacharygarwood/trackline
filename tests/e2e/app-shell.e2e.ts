import { expect, test } from './fixtures.ts';
import {
	addTracker,
	expectOnHome,
	finishFirstRun,
	homeRow,
	openAddTracker,
	openTracker,
	tab,
	templateRow
} from './helpers.ts';
import { messages } from '../../src/lib/i18n/messages.en.ts';

const { templates, onboarding } = messages.tracking;

test('a new user picks what to track and lands on Home with those trackers', async ({ page }) => {
	await page.goto('/app');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(onboarding.title);
	await expect(templateRow(page, templates.workouts)).toHaveAttribute('aria-pressed', 'true');
	await templateRow(page, templates.sleep).click();
	await page.getByRole('button', { name: onboarding.nextWith(3) }).click();
	await page.getByRole('button', { name: onboarding.next, exact: true }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(onboarding.goalsTitle);
	await page.getByRole('button', { name: onboarding.start }).click();

	await expectOnHome(page);
	for (const name of [templates.workouts, templates.water, templates.sleep]) {
		await expect(homeRow(page, name)).toBeVisible();
	}
	await expect(homeRow(page, templates.water)).toContainText('/ 8 glasses a day');
});

test('onboarding needs at least one pick', async ({ page }) => {
	await page.goto('/app/welcome');
	await templateRow(page, templates.workouts).click();
	await templateRow(page, templates.water).click();
	await page.getByRole('button', { name: /^Next/ }).click();

	await expect(page.getByRole('alert')).toHaveText(onboarding.pickOne);
});

test('onboarding asks only each goal’s amount; the editor sets a goal weight in the chosen units', async ({
	page
}) => {
	await page.goto('/app/welcome');
	await templateRow(page, templates.weight).click();
	await page.getByRole('button', { name: /^Next/ }).click();
	await page.getByText(messages.units.lbLong).click();
	await page.getByRole('button', { name: onboarding.next, exact: true }).click();
	await expect(page.getByText(messages.tracking.edit.goalType, { exact: true })).toBeHidden();
	await page.getByRole('spinbutton').nth(0).fill('4');
	await page.getByRole('button', { name: onboarding.start }).click();

	await expectOnHome(page);
	await expect(homeRow(page, templates.workouts)).toContainText('/ 4 workouts a week');
	await expect(homeRow(page, templates.weight)).toContainText('/ 7 days a week');
	await openTracker(page, templates.weight);
	await page.getByRole('button', { name: messages.tracking.page.editTracker }).click();
	await page.getByRole('button', { name: messages.tracking.edit.goalKinds.target }).click();
	await page.getByRole('spinbutton').fill('165');
	await page.getByRole('button', { name: messages.tracking.page.save }).click();
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.weight)).toContainText('Goal 165 lb');
});

test('the tabs open Home and Stats, and the gear opens Settings', async ({ page }) => {
	await finishFirstRun(page);

	await tab(page, messages.navigation.stats).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.tracking.stats.title);
	await tab(page, messages.navigation.home).click();
	await page.getByRole('link', { name: messages.navigation.settings, exact: true }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.settings);
});

test('Settings reorders trackers, and editing one renames or deletes it', async ({ page }) => {
	await finishFirstRun(page);
	await page.getByRole('link', { name: messages.navigation.settings, exact: true }).click();
	await page.getByRole('link', { name: messages.navigation.trackers }).click();
	await page.getByRole('button', { name: messages.tracking.edit.moveUp(templates.water) }).click();
	await tab(page, messages.navigation.home).click();
	await expect(page.getByRole('main').getByRole('listitem').first()).toContainText(templates.water);

	await openTracker(page, templates.water);
	await page.getByRole('button', { name: messages.tracking.page.editTracker }).click();
	await page.getByRole('textbox', { name: messages.tracking.edit.name }).fill('Drink water');
	await page.getByRole('button', { name: messages.tracking.page.save }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Drink water');

	await page.getByRole('button', { name: messages.tracking.page.editTracker }).click();
	await page.getByRole('button', { name: messages.tracking.edit.delete }).click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: messages.tracking.edit.delete })
		.click();
	await expectOnHome(page);
	await expect(homeRow(page, 'Drink water')).toBeHidden();
});

test('Home has no Add tracker button', async ({ page }) => {
	await finishFirstRun(page);

	await expect(page.getByRole('link', { name: messages.tracking.home.addTracker })).toBeHidden();
});

test('Add tracker adds a template and opens it', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, templates.coffee);
	await tab(page, messages.navigation.home).click();

	await expect(homeRow(page, templates.coffee)).toContainText('/ 3 cups max a day');
});

test('a basic tracker is named before it is added, such as photos of a dog', async ({ page }) => {
	await finishFirstRun(page);
	await openAddTracker(page);
	await templateRow(page, templates.photos).click();
	await page.getByRole('button', { name: messages.tracking.add.create }).click();

	await expect(page.getByRole('alert')).toHaveText(messages.tracking.add.nameNeeded);

	await page.getByRole('textbox', { name: messages.tracking.add.name }).fill('Dog');
	await page.getByRole('button', { name: messages.tracking.add.create }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dog');
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, 'Dog')).toBeVisible();
});

test('the landing page links to the app', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: messages.landing.openApp }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(onboarding.title);
});

test('the site follows the device’s light or dark mode, and the app keeps the chosen theme', async ({
	page
}) => {
	const LIGHT_BACKGROUND = 'rgb(246, 246, 243)';
	const DARK_BACKGROUND = 'rgb(11, 11, 12)';
	const body = page.locator('body');
	await page.emulateMedia({ colorScheme: 'light' });
	await finishFirstRun(page);

	await expect(body).toHaveCSS('background-color', DARK_BACKGROUND);
	await page.goto('/');
	await expect(body).toHaveCSS('background-color', LIGHT_BACKGROUND);

	await page.emulateMedia({ colorScheme: 'dark' });
	await expect(body).toHaveCSS('background-color', DARK_BACKGROUND);
	await page.goto('/app/settings/theme');
	await page.getByRole('button', { name: messages.preferences.themes.light, exact: true }).click();
	await expect(body).toHaveCSS('background-color', LIGHT_BACKGROUND);
});

test('iPhone Safari users see how to add the app to the home screen until they dismiss it', async ({
	page
}) => {
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'standalone', { value: false });
	});
	await finishFirstRun(page);

	const hint = page.getByRole('status').filter({ hasText: messages.app.installHint });
	await expect(hint).toBeVisible();
	await hint.getByRole('button', { name: messages.app.dismiss }).click();
	await expect(hint).toBeHidden();

	await page.reload();
	await expectOnHome(page);
	await expect(page.getByText(messages.app.installHint)).toBeHidden();
});
