import { expect, test } from './fixtures.ts';
import { finishFirstRun } from './helpers.ts';
import { messages } from '../../src/lib/i18n/messages.en.ts';

const tabs = [
	messages.navigation.today,
	messages.navigation.train,
	messages.navigation.eat,
	messages.navigation.body,
	messages.navigation.stats
];

test('a new user starts on the welcome screen, then lands on Today', async ({ page }) => {
	await page.goto('/app');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.welcome.title);
	await expect(page.getByText(messages.welcome.privacy)).toBeVisible();
	await expect(page.getByRole('navigation', { name: messages.navigation.tabs })).toBeHidden();
	await page.getByRole('button', { name: messages.welcome.start }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.today);
});

test('the app opens on Today with five tabs', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.today);
	const navigation = page.getByRole('navigation', { name: messages.navigation.tabs });
	for (const tab of tabs) {
		await expect(navigation.getByRole('link', { name: tab })).toBeVisible();
	}
});

test('tapping a tab shows that section and marks it current', async ({ page }) => {
	await finishFirstRun(page);
	const navigation = page.getByRole('navigation', { name: messages.navigation.tabs });

	await navigation.getByRole('link', { name: messages.navigation.body }).click();

	await expect(page).toHaveURL(/\/app\/body$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.body);
	await expect(navigation.getByRole('link', { name: messages.navigation.body })).toHaveAttribute(
		'aria-current',
		'page'
	);
});

test('the gear opens Settings', async ({ page }) => {
	await finishFirstRun(page);

	await page.getByRole('link', { name: messages.navigation.settings }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.navigation.settings);
});

test('the landing page links to the app', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('link', { name: messages.landing.openApp }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.welcome.title);
});
