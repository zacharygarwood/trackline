import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import {
	addTracker,
	amountFields,
	finishFirstRun,
	homeRow,
	openAddTracker,
	openTracker,
	tab,
	templateRow
} from './helpers.ts';

const { templates, page: trackerPage } = messages.tracking;

test('log water with the stepper, see it on Home, then delete and undo it', async ({ page }) => {
	await finishFirstRun(page);
	await openTracker(page, templates.water);

	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	const more = page.getByRole('button', { name: messages.tracking.inputs.more('Glasses') });
	await more.click();
	await more.click();
	await more.click();
	await page.getByRole('button', { name: trackerPage.save }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(templates.water);
	await expect(page.getByRole('list', { name: trackerPage.history })).toContainText('3 glasses');
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.water)).toContainText('3');

	await openTracker(page, templates.water);
	await page.getByRole('list', { name: trackerPage.history }).getByRole('button').first().click();
	await page.getByRole('button', { name: trackerPage.deleteEntry }).click();
	await expect(page.getByText(trackerPage.nothingLogged)).toBeVisible();
	await page.getByRole('button', { name: messages.shell.undo }).click();
	await expect(page.getByRole('list', { name: trackerPage.history })).toContainText('3 glasses');
});

test('the next log starts from the last one', async ({ page }) => {
	await finishFirstRun(page);
	await openTracker(page, templates.water);
	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	await amountFields(page).first().fill('2');
	await page.getByRole('button', { name: trackerPage.save }).click();

	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();

	await expect(amountFields(page).first()).toHaveValue('2');
});

test('a required field must be filled', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, templates.sleep);
	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	await page.getByRole('button', { name: trackerPage.save }).click();

	await expect(page.getByRole('alert')).toHaveText(trackerPage.fillRequired('Time'));
});

test('vitamins are one tap a day', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, templates.vitamins);

	await page.getByRole('button', { name: messages.tracking.inputs.done }).click();

	await expect(page.getByText(messages.tracking.inputs.done, { exact: true })).toBeVisible();
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.vitamins)).toContainText(messages.tracking.values.done);
	await expect(homeRow(page, templates.vitamins)).toContainText(messages.tracking.goal.everyDay);
});

test('a new tracker’s goal is built from simple choices while creating it, like 2 hours of piano a day', async ({
	page
}) => {
	const { edit } = messages.tracking;
	await finishFirstRun(page);
	await openAddTracker(page);
	await templateRow(page, templates.time).click();
	await page.getByRole('textbox', { name: messages.tracking.add.name }).fill('Piano');

	await page.getByRole('button', { name: edit.goalKinds.total }).click();
	await page.getByText(edit.goalPeriods.day, { exact: true }).click();
	await page.getByRole('textbox', { name: messages.tracking.inputs.hours }).fill('2');
	await page.getByRole('textbox', { name: messages.tracking.inputs.minutes }).fill('');
	await expect(page.getByText('2 h a day')).toBeVisible();
	await page.getByRole('button', { name: messages.tracking.add.create }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Piano');

	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, 'Piano')).toContainText('/ 2 h a day');
});

test('water can be counted in oz instead of glasses', async ({ page }) => {
	const { edit } = messages.tracking;
	await finishFirstRun(page);
	await openTracker(page, templates.water);
	await page.getByRole('button', { name: trackerPage.editTracker }).click();

	await page.getByRole('textbox', { name: edit.numberName }).fill('Water');
	await page.getByRole('textbox', { name: edit.unit, exact: true }).fill('oz');
	await amountFields(page).fill('64');
	await page.getByRole('button', { name: trackerPage.save }).click();

	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	await amountFields(page).first().fill('16');
	await expect(page.getByText('oz', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: trackerPage.save }).click();
	await expect(page.getByRole('list', { name: trackerPage.history })).toContainText('16 oz');
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.water)).toContainText('/ 64 oz a day');
});

test('a number tracker can be given its own unit while creating it', async ({ page }) => {
	await finishFirstRun(page);
	await openAddTracker(page);
	await templateRow(page, templates.number).click();
	await page.getByRole('textbox', { name: messages.tracking.add.name }).fill('Push-ups');
	await page.getByRole('textbox', { name: messages.tracking.add.unit }).fill('reps');
	await page.getByRole('button', { name: messages.tracking.add.create }).click();

	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	await amountFields(page).first().fill('20');
	await page.getByRole('button', { name: trackerPage.save }).click();
	await expect(page.getByRole('list', { name: trackerPage.history })).toContainText('20 reps');
});

test('a weight takes decimals, typed one key at a time', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, templates.weight);

	await page.getByRole('button', { name: trackerPage.log, exact: true }).click();
	await amountFields(page).first().pressSequentially('72.5');
	await page.getByRole('button', { name: trackerPage.save }).click();

	await expect(page.getByRole('list', { name: trackerPage.history })).toContainText('72.5');
});
