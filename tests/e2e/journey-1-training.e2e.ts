import type { Locator, Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { finishFirstRun } from './helpers.ts';

function set(page: Page, number: number): Locator {
	return page.getByRole('group', { name: messages.training.setNumber(number), exact: true });
}

async function enter(field: Locator, value: string): Promise<void> {
	await field.fill(value);
	await field.press('Tab');
}

test('log a workout, repeat it from a template, keep the streak with a rest day, and see it in Stats', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-10-01T09:00:00'));
	await finishFirstRun(page);

	await page.getByRole('link', { name: messages.navigation.train }).click();
	await expect(page.getByText(messages.training.noTemplates)).toBeVisible();
	await page.getByRole('button', { name: messages.training.startWorkout }).click();
	await page.getByRole('button', { name: messages.training.addExercise }).click();
	await page.getByRole('dialog').getByRole('textbox').fill('Squat');
	await page.getByRole('button', { name: messages.training.addNamed('Squat') }).click();

	await expect(page.getByText(messages.training.firstTime)).toBeVisible();
	await enter(set(page, 1).getByRole('textbox', { name: messages.training.reps }), '5');
	await enter(set(page, 1).getByRole('textbox', { name: messages.training.weight('kg') }), '100');
	await set(page, 1)
		.getByRole('button', { name: messages.training.completeSet(1) })
		.click();
	await page.getByRole('button', { name: messages.training.addSet }).click();
	await expect(set(page, 2).getByRole('textbox', { name: messages.training.reps })).toHaveValue(
		'5'
	);
	await expect(
		set(page, 2).getByRole('textbox', { name: messages.training.weight('kg') })
	).toHaveValue('100');
	await set(page, 2)
		.getByRole('button', { name: messages.training.completeSet(2) })
		.click();

	await page.getByRole('button', { name: messages.training.finishWorkout }).click();
	const saveSheet = page.getByRole('dialog', { name: messages.training.workoutSaved });
	await saveSheet.getByRole('textbox').fill('Legs');
	await saveSheet.getByRole('button', { name: messages.training.saveTemplate }).click();
	await expect(saveSheet).toBeHidden();
	await expect(page.getByText('Squat · 2 sets')).toBeVisible();

	await page
		.getByRole('button', { name: `Legs ${messages.training.templateSummary(1)}`, exact: true })
		.click();
	await expect(page.getByText('Last time: 5 × 100.0 kg, 5 × 100.0 kg')).toBeVisible();
	for (const number of [1, 2]) {
		await expect(
			set(page, number).getByRole('textbox', { name: messages.training.reps })
		).toHaveValue('5');
		await expect(
			set(page, number).getByRole('textbox', { name: messages.training.weight('kg') })
		).toHaveValue('100');
	}
	await page.getByRole('button', { name: messages.training.discardWorkout }).click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: messages.training.discardWorkout })
		.click();
	await expect(page.getByRole('button', { name: messages.training.startWorkout })).toBeVisible();

	await page.clock.setFixedTime(new Date('2026-10-02T09:00:00'));
	await page.reload();
	await page
		.getByRole('button', { name: messages.training.markRestDay(messages.dates.today) })
		.click();

	await expect(page.getByText(messages.training.weekSummary(1, 1))).toBeVisible();
	await expect(
		page.getByRole('button', { name: messages.training.markRestDay(messages.dates.today) })
	).toHaveAttribute('aria-pressed', 'true');

	await page.getByRole('link', { name: messages.navigation.stats }).click();
	await expect(page.getByText(messages.stats.days(2)).first()).toBeVisible();
	await expect(page.getByRole('img', { name: messages.stats.trainingHeatmap(1, 1) })).toBeVisible();
	await expect(
		page.getByRole('img', {
			name: messages.stats.exerciseSummary({
				name: 'Squat',
				sessions: 1,
				heaviest: '100.0 kg',
				best: '116.7 kg'
			})
		})
	).toBeVisible();
});
