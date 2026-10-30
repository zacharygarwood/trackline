import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { checkIn, finishFirstRun } from './helpers.ts';

const WEIGH_INS = [
	{ day: '2026-10-01', weight: '81' },
	{ day: '2026-10-02', weight: '80.5' },
	{ day: '2026-10-03', weight: '79' }
] as const;

test('check in on three days and see the change over 90 days', async ({ page }) => {
	await finishFirstRun(page);
	for (const { day, weight } of WEIGH_INS) {
		await page.clock.setFixedTime(new Date(`${day}T08:00:00`));
		await checkIn(page, weight);
	}

	await expect(
		page.getByRole('img', {
			name: messages.checkIn.chart({ direction: 'down', change: '2.0', unit: 'kg', latest: '79.0' })
		})
	).toBeVisible();
	await expect(page.getByRole('button', { name: messages.checkIn.update })).toBeVisible();
	await page.getByRole('link', { name: messages.navigation.today }).click();
	await expect(page.getByText(/^79\.0\s*kg$/)).toBeVisible();
});

test('the weight steps by a tenth, and undoing a check-in takes it back', async ({ page }) => {
	await finishFirstRun(page);
	await page.goto('/app/body');
	const field = page.getByRole('spinbutton', { name: messages.checkIn.weightIn('kg') });
	await field.fill('80');
	await page.getByRole('button', { name: messages.checkIn.tenthMore }).click();
	await expect(field).toHaveValue('80.1');
	await page.getByRole('button', { name: messages.checkIn.checkIn }).click();
	await expect(page.getByRole('button', { name: messages.checkIn.update })).toBeVisible();

	await page.getByRole('button', { name: messages.shell.undo }).click();
	await expect(page.getByRole('button', { name: messages.checkIn.checkIn })).toBeVisible();
});

test('switching to pounds converts shown weights', async ({ page }) => {
	await finishFirstRun(page);
	await checkIn(page, '80');

	await page.getByRole('link', { name: messages.navigation.settings }).click();
	await page.getByRole('button', { name: messages.units.lb, exact: true }).click();
	await page.getByRole('link', { name: messages.navigation.today }).click();

	await expect(page.getByText(/^176\.4\s*lb$/)).toBeVisible();
});
