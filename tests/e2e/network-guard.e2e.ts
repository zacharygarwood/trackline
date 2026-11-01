import { expect, test } from './fixtures.ts';
import { homeBar, tab } from './helpers.ts';
import { messages } from '../../src/lib/i18n/messages.en.ts';

const LOCAL_SCHEMES = new Set(['data:', 'blob:']);

test('the app makes no requests outside its own origin', async ({ page, baseURL }) => {
	const appOrigin = new URL(baseURL ?? '').origin;
	const foreignRequests: string[] = [];
	page.on('request', (request) => {
		const url = new URL(request.url());
		if (!LOCAL_SCHEMES.has(url.protocol) && url.origin !== appOrigin) {
			foreignRequests.push(url.origin);
		}
	});

	await page.goto('/');
	await page.getByRole('link', { name: messages.landing.openApp }).click();
	await page.getByRole('button', { name: messages.welcome.start }).click();
	for (const bar of [messages.nutrition.calories, messages.home.workouts]) {
		await homeBar(page, bar).click();
		await tab(page, messages.navigation.home).click();
	}
	await page.getByRole('link', { name: messages.navigation.settings, exact: true }).click();
	await page.getByRole('link', { name: messages.navigation.support }).click();
	await page.waitForLoadState('networkidle');

	expect(foreignRequests).toEqual([]);
});
