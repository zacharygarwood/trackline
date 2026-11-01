import { expect, test } from './fixtures.ts';
import { expectOnHome, finishFirstRun, homeBar } from './helpers.ts';
import { messages } from '../../src/lib/i18n/messages.en.ts';

test('after one visit, the app opens and navigates with no network', async ({ page, context }) => {
	await finishFirstRun(page);
	await page.evaluate(async () => {
		await navigator.serviceWorker.ready;
	});
	await expect
		.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
		.toBe(true);

	const wasmPrecached = await page.evaluate(async () => {
		const names = await caches.keys();
		const keys = await Promise.all(names.map(async (name) => (await caches.open(name)).keys()));
		return keys.flat().some((request) => request.url.endsWith('.wasm'));
	});
	expect(wasmPrecached).toBe(true);

	await context.setOffline(true);
	await page.reload();

	await expectOnHome(page);
	await homeBar(page, messages.home.workouts).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(messages.home.workouts);
});
