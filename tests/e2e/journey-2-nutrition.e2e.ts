import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';

async function startWithGoals(page: Page): Promise<void> {
	await page.goto('/app/welcome');
	const goals = { calories: '2000', protein: '150', carbs: '250', fat: '70' };
	await page.getByRole('textbox', { name: messages.nutrition.calories }).fill(goals.calories);
	await page.getByRole('textbox', { name: messages.nutrition.protein }).fill(goals.protein);
	await page.getByRole('textbox', { name: messages.nutrition.carbs }).fill(goals.carbs);
	await page.getByRole('textbox', { name: messages.nutrition.fat }).fill(goals.fat);
	await page.getByRole('button', { name: messages.welcome.start }).click();
	await page.getByRole('link', { name: messages.navigation.eat }).click();
}

async function createChicken(page: Page): Promise<void> {
	await page.getByRole('searchbox', { name: messages.food.search }).fill('chicken breast');
	await page.getByRole('spinbutton', { name: messages.food.amount }).fill('100');
	await page.getByRole('button', { name: 'g', exact: true }).click();
	await page.getByRole('spinbutton', { name: messages.food.calories }).fill('165');
	await page.getByRole('spinbutton', { name: messages.food.proteinGrams }).fill('31');
	await page.getByRole('button', { name: messages.food.add, exact: true }).click();
	await expect(
		page.getByText(messages.food.added('Chicken breast', '100 g')).first()
	).toBeVisible();
}

test('create a food, log a different amount, and see the totals against the goals', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-10-27T12:30:00'));
	await startWithGoals(page);
	await createChicken(page);

	await page.getByRole('button', { name: messages.food.chooseAmount('Chicken breast') }).click();
	await page.getByRole('button', { name: messages.food.more }).click();
	await expect(page.getByText('182 kcal, 34 g protein')).toBeVisible();
	await page.getByRole('button', { name: messages.food.add, exact: true }).click();
	await expect(
		page.getByText(messages.food.added('Chicken breast', '110 g')).first()
	).toBeVisible();

	const eaten = page.getByRole('list', { name: messages.food.eatenToday });
	await expect(eaten.getByRole('button', { name: 'Chicken breast, 100 g' })).toBeVisible();
	await expect(eaten.getByRole('button', { name: 'Chicken breast, 110 g' })).toBeVisible();
	await expect(page.getByText(/^347\s*\/ 2,000 kcal$/)).toBeVisible();

	await page.getByRole('link', { name: messages.navigation.today }).click();
	await expect(page.getByText(/^347\s*\/ 2,000$/)).toBeVisible();
	await expect(page.getByText(/^65\s*\/ 150 g$/)).toBeVisible();
});

test('add a recent food with one tap, undo it, and remove and restore what was eaten', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-10-27T08:00:00'));
	await startWithGoals(page);
	await createChicken(page);
	const eaten = page.getByRole('list', { name: messages.food.eatenToday });

	await page
		.getByRole('button', { name: messages.food.addBase('100 g', 'Chicken breast') })
		.click();
	await expect(eaten.getByRole('listitem')).toHaveCount(2);
	await page.getByRole('button', { name: messages.shell.undo }).click();
	await expect(eaten.getByRole('listitem')).toHaveCount(1);

	await eaten.getByRole('button', { name: 'Chicken breast, 100 g' }).click();
	await page.getByRole('button', { name: messages.food.remove }).click();
	await expect(page.getByText(messages.food.nothingYet)).toBeVisible();
	await page.getByRole('button', { name: messages.shell.undo }).click();
	await expect(eaten.getByRole('listitem')).toHaveCount(1);
});
