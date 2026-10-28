import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { finishFirstRun, weighIn } from './helpers.ts';

const WEIGH_INS = [
	{ day: '2026-10-01', weight: '81' },
	{ day: '2026-10-02', weight: '80.5' },
	{ day: '2026-10-03', weight: '79' }
] as const;

test('weigh in on three days and see the points and the 7-day average', async ({ page }) => {
	await finishFirstRun(page);
	for (const { day, weight } of WEIGH_INS) {
		await page.clock.setFixedTime(new Date(`${day}T08:00:00`));
		await weighIn(page, weight);
	}

	const chart = page.getByRole('img', { name: /^Weight chart/ });
	await expect(chart).toHaveAccessibleName(
		'Weight chart with 3 weigh-ins. Latest 79.0 kg, 7-day average 80.2 kg.'
	);
	await expect(chart.locator('circle')).toHaveCount(3);
	await expect(page.getByRole('button', { name: /^Today, 79\.0 kg/ })).toBeVisible();
	await expect(page.getByRole('button', { name: /^Yesterday, 80\.5 kg/ })).toBeVisible();
});

test('switching to pounds converts shown weights and the number pad suggestion', async ({
	page
}) => {
	await finishFirstRun(page);
	await weighIn(page, '80');

	await page.getByRole('link', { name: messages.navigation.settings }).click();
	await page.getByText(messages.units.lbLong).click();
	await page.getByRole('link', { name: messages.navigation.body }).click();

	await expect(page.getByRole('button', { name: /^Today, 176\.4 lb/ })).toBeVisible();
	await page.getByRole('button', { name: messages.body.weighIn }).click();
	await expect(page.getByRole('dialog').getByRole('status')).toHaveText(/176\.4\s*lb/);
});
