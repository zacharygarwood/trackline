import { expect, test } from './fixtures.ts';
import { messages } from '../../src/lib/i18n/messages.en.ts';

test('the app creates its database in the origin private file system', async ({ page }) => {
	await page.goto('/app');

	await expect
		.poll(() =>
			page.evaluate(async () => {
				const root = await navigator.storage.getDirectory();
				const names: string[] = [];
				for await (const name of root.keys()) names.push(name);
				return names.length;
			})
		)
		.toBeGreaterThan(0);
	await expect(page.getByText(messages.app.storageUnavailable)).toBeHidden();
});
