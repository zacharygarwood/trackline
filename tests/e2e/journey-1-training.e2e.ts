import type { Page } from '@playwright/test';
import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { finishFirstRun } from './helpers.ts';

async function createExercise(page: Page, name: string, fields: readonly string[]): Promise<void> {
	await page.getByRole('searchbox', { name: messages.train.search }).fill(name);
	for (const field of fields) {
		await page.getByRole('button', { name: field, exact: true }).click();
	}
	await page.getByRole('button', { name: messages.exercise.saveToLibrary }).click();
	await expect(page.getByText(messages.train.saved(name)).first()).toBeVisible();
}

test('create an exercise, log sets, finish, see it in Stats, and repeat it from Workouts', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-10-01T09:00:00'));
	await finishFirstRun(page);
	await page.getByRole('link', { name: messages.navigation.train }).click();
	await createExercise(page, 'Squat', [
		messages.exercise.fields.weight,
		messages.exercise.fields.reps
	]);

	await page.getByRole('button', { name: messages.train.startExercise('Squat') }).click();
	await expect(page.getByRole('heading', { name: 'Squat', level: 1 })).toBeVisible();
	await page.getByRole('spinbutton', { name: 'kg' }).fill('100');
	await page.getByRole('spinbutton', { name: messages.workout.reps }).fill('5');
	await page.getByRole('button', { name: messages.workout.logSet }).click();
	await page.getByRole('button', { name: new RegExp(messages.workout.skip) }).click();
	await page.getByRole('button', { name: messages.workout.logSet }).click();
	await expect(
		page.getByRole('button', { name: messages.workout.setLogged(2, '100 × 5') })
	).toBeVisible();

	await page.getByRole('button', { name: messages.workout.finish }).click();
	await expect(page.getByText(messages.workout.saved).first()).toBeVisible();

	await page.getByRole('link', { name: messages.navigation.stats }).click();
	await page.getByRole('button', { name: /^Squat/ }).click();
	await expect(page.getByText('2 × 5 at 100 kg')).toBeVisible();
	await page.getByRole('button', { name: messages.trends.saveToWorkouts }).click();
	await expect(page.getByText(messages.trends.savedToWorkouts).first()).toBeVisible();

	await page.getByRole('link', { name: messages.navigation.train }).click();
	await page.getByRole('button', { name: 'Squat', exact: true }).click();
	await page.getByRole('button', { name: messages.train.start, exact: true }).click();
	await expect(page.getByRole('spinbutton', { name: 'kg' })).toHaveValue('100');

	await page.getByRole('button', { name: messages.workout.discard }).click();
	await expect(page.getByText(messages.workout.discarded).first()).toBeVisible();
	await page.getByRole('button', { name: messages.shell.undo }).click();
	await expect(page.getByRole('heading', { name: 'Squat', level: 1 })).toBeVisible();
});

test('time an effort with a distance, and log climbs by grade', async ({ page }) => {
	await finishFirstRun(page);
	await page.getByRole('link', { name: messages.navigation.train }).click();
	await createExercise(page, 'Bouldering', [messages.exercise.fields.grade]);

	await page.getByRole('button', { name: messages.train.startExercise('Bouldering') }).click();
	const grades = page.getByRole('group', { name: messages.workout.grade });
	await grades.getByRole('button', { name: 'V4', exact: true }).click();
	await page.getByRole('button', { name: messages.workout.log, exact: true }).click();
	await expect(page.getByRole('list', { name: messages.workout.logged })).toContainText('V4');

	await page.getByRole('button', { name: messages.workout.addExercise }).click();
	await page.getByRole('searchbox', { name: messages.train.search }).fill('Run');
	await page.getByRole('button', { name: messages.exercise.fields.time, exact: true }).click();
	await page.getByRole('button', { name: messages.exercise.fields.distance, exact: true }).click();
	await page.getByRole('button', { name: messages.exercise.saveToWorkout }).click();
	await expect(page.getByRole('heading', { name: 'Run', level: 1 })).toBeVisible();
	await page.getByRole('spinbutton', { name: 'mi' }).fill('3.1');
	await page.getByRole('button', { name: messages.workout.startClock, exact: true }).click();
	await expect(page.getByRole('button', { name: messages.workout.pause })).toBeVisible();
	await page.getByRole('button', { name: messages.workout.done, exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Bouldering', level: 1 })).toBeVisible();
	await page.getByRole('button', { name: messages.workout.doneWith('Bouldering') }).click();

	await expect(page.getByRole('heading', { name: messages.workout.allDone })).toBeVisible();
	await page.getByRole('button', { name: messages.workout.finishWorkout }).click();
	await expect(page.getByText(messages.workout.saved).first()).toBeVisible();
});
