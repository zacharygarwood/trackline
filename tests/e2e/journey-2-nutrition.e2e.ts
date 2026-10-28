import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { typeOnNumberPad } from './helpers.ts';

test('create a food, log a different amount, and see scaled macros and goal progress', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-10-27T12:30:00'));
	await page.goto('/app/welcome');
	const goals = { calories: '2000', protein: '150', carbs: '250', fat: '70' };
	await page.getByRole('textbox', { name: messages.nutrition.calories }).fill(goals.calories);
	await page.getByRole('textbox', { name: messages.nutrition.protein }).fill(goals.protein);
	await page.getByRole('textbox', { name: messages.nutrition.carbs }).fill(goals.carbs);
	await page.getByRole('textbox', { name: messages.nutrition.fat }).fill(goals.fat);
	await page.getByRole('button', { name: messages.nutrition.saveGoals }).click();
	await expect(page.getByText(messages.nutrition.goalsSaved)).toBeVisible();
	await page.getByRole('button', { name: messages.welcome.start }).click();

	await page.getByRole('link', { name: messages.navigation.eat }).click();
	await page.getByRole('button', { name: messages.nutrition.logFood }).click();
	const sheet = page.getByRole('dialog');
	await sheet.getByRole('button', { name: messages.nutrition.newFood }).click();
	await sheet.getByRole('textbox', { name: messages.nutrition.foodName }).fill('Chicken breast');
	await sheet.getByRole('textbox', { name: messages.nutrition.calories }).fill('165');
	await sheet.getByRole('textbox', { name: messages.nutrition.protein }).fill('31');
	await sheet.getByRole('textbox', { name: messages.nutrition.carbs }).fill('0');
	await sheet.getByRole('textbox', { name: messages.nutrition.fat }).fill('3.6');
	await sheet.getByRole('button', { name: messages.nutrition.saveFood }).click();

	await expect(sheet.getByRole('status')).toHaveText(/100\s*g/);
	await typeOnNumberPad(page, '150');
	await expect(sheet.getByText('248 kcal · P 46.5 g · C 0 g · F 5.4 g')).toBeVisible();
	await sheet.getByRole('button', { name: messages.nutrition.log }).click();
	await expect(sheet).toBeHidden();

	const lunch = page.getByRole('region', { name: messages.nutrition.lunch });
	await expect(
		lunch.getByRole('button', { name: 'Chicken breast, 150 g, 248 kcal' })
	).toBeVisible();
	await expect(page.getByRole('meter', { name: 'Calories: 248 kcal of 2,000 kcal' })).toBeVisible();
	await expect(page.getByText('1,753 kcal left')).toBeVisible();
	await expect(page.getByText('103.5 g left')).toBeVisible();

	await page.getByRole('link', { name: messages.navigation.today }).click();
	await expect(page.getByRole('meter', { name: 'Protein: 46.5 g of 150 g' })).toBeVisible();
});

test('a saved food is logged again in three taps with last time’s amount', async ({ page }) => {
	await page.clock.setFixedTime(new Date('2026-10-27T08:00:00'));
	await page.goto('/app/welcome');
	await page.getByRole('button', { name: messages.welcome.start }).click();
	await page.getByRole('link', { name: messages.navigation.eat }).click();
	await page.getByRole('button', { name: messages.nutrition.logFood }).click();
	const sheet = page.getByRole('dialog');
	await sheet.getByRole('button', { name: messages.nutrition.newFood }).click();
	await sheet.getByRole('textbox', { name: messages.nutrition.foodName }).fill('Oats');
	for (const [field, value] of [
		[messages.nutrition.calories, '389'],
		[messages.nutrition.protein, '17'],
		[messages.nutrition.carbs, '66'],
		[messages.nutrition.fat, '7']
	] as const) {
		await sheet.getByRole('textbox', { name: field }).fill(value);
	}
	await sheet.getByRole('button', { name: messages.nutrition.saveFood }).click();
	await typeOnNumberPad(page, '60');
	await sheet.getByRole('button', { name: messages.nutrition.log }).click();
	await expect(sheet).toBeHidden();

	await page.getByRole('button', { name: messages.nutrition.logFood }).click();
	await sheet.getByRole('button', { name: 'Oats', exact: true }).click();
	await expect(sheet.getByRole('status')).toHaveText(/60\s*g/);
	await sheet.getByRole('button', { name: messages.nutrition.log }).click();

	const breakfast = page.getByRole('region', { name: messages.nutrition.breakfast });
	await expect(breakfast.getByRole('button', { name: /^Oats, 60 g/ })).toHaveCount(2);
});
