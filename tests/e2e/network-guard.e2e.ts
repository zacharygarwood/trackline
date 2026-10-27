import { expect, test } from '@playwright/test';

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
	await page.waitForLoadState('networkidle');

	expect(foreignRequests).toEqual([]);
});
