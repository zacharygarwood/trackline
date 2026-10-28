import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';

const WEIGH_INS = [
	{ day: '2026-10-01', weight: '81' },
	{ day: '2026-10-02', weight: '80.5' },
	{ day: '2026-10-03', weight: '79' }
] as const;

test('weigh in on three days and see the points and the 7-day average', async ({ page }) => {
	for (const { day, weight } of WEIGH_INS) {
		await page.clock.setFixedTime(new Date(`${day}T08:00:00`));
		await page.goto('/app/body');
		await page.getByRole('button', { name: messages.body.weighIn }).click();

		const sheet = page.getByRole('dialog', { name: messages.body.weighIn });
		for (const key of weight) {
			const name = key === '.' ? messages.design.decimalSeparator : key;
			await sheet.getByRole('button', { name, exact: true }).click();
		}
		await sheet.getByRole('button', { name: messages.body.save }).click();
		await expect(sheet).toBeHidden();
	}

	const chart = page.getByRole('img', { name: /^Weight chart/ });
	await expect(chart).toHaveAccessibleName(
		'Weight chart with 3 weigh-ins. Latest 79.0 kg, 7-day average 80.2 kg.'
	);
	await expect(chart.locator('circle')).toHaveCount(3);
	await expect(page.getByRole('button', { name: /^Today, 79\.0 kg/ })).toBeVisible();
	await expect(page.getByRole('button', { name: /^Yesterday, 80\.5 kg/ })).toBeVisible();
});

test('the weigh-in sheet suggests the last weight, and switching to pounds converts it', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-10-01T08:00:00'));
	await page.goto('/app/body');
	await page.getByRole('button', { name: messages.body.weighIn }).click();
	const sheet = page.getByRole('dialog', { name: messages.body.weighIn });
	for (const key of ['8', '0']) await sheet.getByRole('button', { name: key, exact: true }).click();
	await sheet.getByRole('button', { name: messages.body.save }).click();

	await page.getByRole('link', { name: messages.navigation.settings }).click();
	await page.getByText(messages.units.lbLong).click();
	await page.getByRole('link', { name: messages.navigation.body }).click();

	await expect(page.getByRole('button', { name: /^Today, 176\.4 lb/ })).toBeVisible();
	await page.getByRole('button', { name: messages.body.weighIn }).click();
	await expect(page.getByRole('dialog').getByRole('status')).toHaveText(/176\.4\s*lb/);
});
