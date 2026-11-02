import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { addTracker, amountFields, finishFirstRun, homeRow, tab } from './helpers.ts';

const { food, library, templates } = messages.tracking;

test('add a new food, eat two servings, and see the day’s totals', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, templates.food);

	await page.getByRole('button', { name: food.add }).click();
	await page.getByRole('searchbox', { name: food.search }).fill('Oats');
	await page.getByRole('button', { name: food.create('Oats') }).click();
	await amountFields(page).nth(0).fill('150');
	await amountFields(page).nth(1).fill('5');
	await page.getByRole('button', { name: library.save }).click();
	await page.getByRole('button', { name: 'Oats' }).click();
	await page.getByRole('button', { name: messages.tracking.inputs.more(food.servings) }).click();
	await page.getByRole('button', { name: messages.tracking.inputs.more(food.servings) }).click();
	await expect(page.getByText('300 kcal')).toBeVisible();
	await page.getByRole('button', { name: food.add_portion, exact: true }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(templates.food);
	await expect(page.getByRole('list', { name: food.today })).toContainText('Oats');
	await expect(page.getByText('10 g').first()).toBeVisible();
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.food)).toContainText('300');
});

test('quick add logs calories without a food', async ({ page }) => {
	await finishFirstRun(page);
	await addTracker(page, templates.food);
	await page.getByRole('button', { name: food.add }).click();
	await page.getByRole('button', { name: food.quickAdd }).click();
	await amountFields(page).nth(1).fill('420');
	await page.getByRole('button', { name: messages.tracking.page.save }).click();
	await page.goBack();

	await expect(page.getByRole('list', { name: food.today })).toContainText(food.quickEntry);
});

test('a recipe made of saved foods logs its numbers per serving', async ({ page }) => {
	const { recipe } = messages.tracking;
	await finishFirstRun(page);
	await addTracker(page, templates.food);
	await page.getByRole('button', { name: food.add }).click();
	for (const [name, calories] of [
		['Oats', '150'],
		['Milk', '100']
	] as const) {
		await page.getByRole('searchbox', { name: food.search }).fill(name);
		await page.getByRole('button', { name: food.create(name) }).click();
		await amountFields(page).nth(0).fill(calories);
		await page.getByRole('button', { name: library.save }).click();
	}

	await page.getByRole('button', { name: library.newRecipe }).click();
	await page.getByRole('textbox', { name: library.name }).fill('Porridge');
	await page.getByRole('textbox', { name: recipe.makes }).fill('2');
	for (const name of ['Oats', 'Milk']) {
		await page.getByRole('searchbox', { name: recipe.addIngredient }).fill(name);
		await page.getByRole('button', { name, exact: true }).click();
	}
	await expect(page.getByText('125 kcal')).toBeVisible();
	await page.getByRole('button', { name: library.save }).click();
	await page.getByRole('searchbox', { name: food.search }).fill('');
	await page.getByRole('button', { name: 'Porridge' }).click();
	await page.getByRole('button', { name: food.add_portion, exact: true }).click();

	await expect(page.getByRole('list', { name: food.today })).toContainText('Porridge');
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.food)).toContainText('125');
});
