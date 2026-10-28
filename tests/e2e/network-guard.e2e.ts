import { expect, test } from './fixtures.ts';
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
	const navigation = page.getByRole('navigation', { name: messages.navigation.tabs });
	for (const tab of [
		messages.navigation.train,
		messages.navigation.eat,
		messages.navigation.body,
		messages.navigation.stats
	]) {
		await navigation.getByRole('link', { name: tab }).click();
	}
	await page.getByRole('link', { name: messages.navigation.settings }).click();
	await page.waitForLoadState('networkidle');

	expect(foreignRequests).toEqual([]);
});
