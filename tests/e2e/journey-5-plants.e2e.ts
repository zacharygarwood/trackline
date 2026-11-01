import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { addTracker, finishFirstRun } from './helpers.ts';

const { library } = messages.tracking;

test('add a plant, water it, and see when it was last watered', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, messages.tracking.templates.plants);

	await page.getByRole('button', { name: library.newThing }).click();
	await page.getByRole('textbox', { name: library.name }).fill('Monstera');
	await page.getByRole('button', { name: library.save }).click();
	await page.getByRole('button', { name: /^Monstera/ }).click();
	await page.getByRole('button', { name: messages.tracking.fields.watered }).click();

	await expect(page.getByText(library.wateredToday)).toBeVisible();
	await page.goBack();
	await expect(page.getByRole('button', { name: /^Monstera/ })).toContainText(
		library.lastLogged(messages.dates.today)
	);
});
