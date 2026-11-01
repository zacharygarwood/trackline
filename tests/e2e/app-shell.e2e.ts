import { expect, test } from './fixtures.ts';
import { expectOnHome, finishFirstRun, homeBar, tab } from './helpers.ts';
import { messages } from '../../src/lib/i18n/messages.en.ts';

const bars = [messages.nutrition.calories, messages.nutrition.protein, messages.home.workouts];

test('a new user starts on the welcome screen, then lands on Home', async ({ page }) => {
	await page.goto('/app');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.welcome.title);
	await expect(page.getByRole('radio', { name: messages.units.kgLong })).toBeChecked();
	await page.getByRole('button', { name: messages.welcome.start }).click();

	await expectOnHome(page);
});

test('Home starts with the bars it always had, and weight once there is a goal weight', async ({
	page
}) => {
	await finishFirstRun(page);

	for (const bar of bars) {
		await expect(homeBar(page, bar)).toBeVisible();
	}
	await expect(homeBar(page, messages.home.weight)).toBeHidden();
});

test('tapping a bar opens its tab, and the Home tab returns', async ({ page }) => {
	await finishFirstRun(page);

	await homeBar(page, messages.home.workouts).click();

	await expect(page).toHaveURL(/\/app\/train$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.home.workouts);
	await expect(tab(page, messages.home.workouts)).toHaveAttribute('aria-current', 'page');
	await tab(page, messages.navigation.home).click();
	await expectOnHome(page);
});

test('the tab bar opens each main page', async ({ page }) => {
	await finishFirstRun(page);

	for (const [label, url] of [
		[messages.navigation.eat, /\/app\/eat$/],
		[messages.home.workouts, /\/app\/train$/],
		[messages.home.weight, /\/app\/body$/],
		[messages.navigation.stats, /\/app\/stats$/]
	] as const) {
		await tab(page, label).click();
		await expect(page).toHaveURL(url);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(label);
	}
});

test('Settings lists the trackers, and deleting one takes it off Home', async ({ page }) => {
	await finishFirstRun(page);
	await page.getByRole('link', { name: messages.navigation.settings, exact: true }).click();
	await page.getByRole('link', { name: messages.navigation.homeScreen }).click();

	await page.getByRole('button', { name: /^Calories/ }).click();
	await page.getByRole('button', { name: messages.trackers.delete }).click();
	await tab(page, messages.navigation.home).click();

	await expect(homeBar(page, messages.nutrition.calories)).toBeHidden();
	await expect(homeBar(page, messages.home.workouts)).toBeVisible();
});

test('a tracker made from a preset is logged on its own page and fills its bar', async ({
	page
}) => {
	await finishFirstRun(page);
	await page.goto('/app/settings/home');

	await page.getByRole('link', { name: messages.trackers.addTracker }).click();
	await page.getByRole('button', { name: /^Water/ }).click();
	await expect(page.getByRole('textbox', { name: messages.trackers.goal })).toHaveValue('8');
	await page.getByRole('button', { name: messages.train.save }).click();
	await tab(page, messages.navigation.home).click();

	await homeBar(page, 'Water').click();
	await page.getByRole('textbox', { name: 'glasses' }).fill('3');
	await page.getByRole('button', { name: messages.trackers.log, exact: true }).click();
	await expect(page.getByRole('list', { name: messages.trackers.history })).toContainText(
		'3 glasses'
	);
	await tab(page, messages.navigation.home).click();
	await expect(homeBar(page, 'Water')).toContainText('/ 8 glasses');
	await expect(homeBar(page, 'Water')).toContainText('3');
});

test('a tracker can be built from an exercise', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/train/exercises');
	await page.getByRole('searchbox', { name: messages.train.search }).fill('Climbing');
	await page.getByRole('button', { name: messages.train.addNewExercise('Climbing') }).click();
	await page.getByRole('button', { name: messages.exercise.fields.grade, exact: true }).click();
	await page.getByRole('button', { name: messages.exercise.saveToLibrary }).click();
	await expect(page.getByText(messages.train.saved('Climbing')).first()).toBeVisible();

	await page.goto('/app/tracker/add');
	await page.getByRole('button', { name: messages.trackers.buildYourOwn }).click();
	await page.getByRole('button', { name: messages.trackers.sources.workouts, exact: true }).click();
	await page.getByRole('button', { name: messages.trackers.measures.sessions }).click();
	await page.getByRole('combobox', { name: messages.trackers.which('workouts') }).selectOption({
		label: 'Climbing'
	});
	await page.getByRole('textbox', { name: messages.trackers.goal }).fill('3');
	await page.getByRole('button', { name: messages.trackers.periods.week }).click();
	await page.getByRole('button', { name: messages.train.save }).click();

	await tab(page, messages.navigation.home).click();
	await expect(homeBar(page, 'Climbing')).toContainText('/ 3 sessions');
});

test('the gear opens Settings', async ({ page }) => {
	await finishFirstRun(page);

	await page.getByRole('link', { name: messages.navigation.settings, exact: true }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.settings);
});

test('the landing page links to the app', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: messages.landing.openApp }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.welcome.title);
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

test('first-run goals are saved with Get started, in the chosen units', async ({ page }) => {
	await page.goto('/app/welcome');
	await page.getByText(messages.units.lbLong).click();
	const goalWeight = page.getByRole('textbox', {
		name: messages.welcome.optional(messages.body.goalWeight)
	});
	await expect(goalWeight.locator('..')).toContainText(messages.units.lb);
	await goalWeight.fill('165');
	await page.getByText(messages.body.gain).click();
	await page.getByRole('textbox', { name: messages.nutrition.calories }).fill('2400');
	await page.getByRole('button', { name: messages.welcome.start }).click();

	await expect(page.getByRole('alert')).toHaveText(messages.nutrition.checkGoals);
	for (const macro of [
		messages.nutrition.protein,
		messages.nutrition.carbs,
		messages.nutrition.fat
	]) {
		await page.getByRole('textbox', { name: macro }).fill('100');
	}
	await page.getByRole('button', { name: messages.welcome.start }).click();
	await expectOnHome(page);

	await expect(homeBar(page, messages.nutrition.calories)).toContainText('/ 2,400 kcal');
	await expect(homeBar(page, messages.home.weight)).toContainText('to 165 lb');
	await page.goto('/app/settings/tracking');
	await expect(
		page.getByRole('group', { name: messages.preferences.weight }).getByRole('button', {
			name: messages.units.lb
		})
	).toHaveAttribute('aria-pressed', 'true');
});
