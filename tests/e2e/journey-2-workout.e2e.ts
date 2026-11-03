import { messages } from '../../src/lib/i18n/messages.en.ts';
import { expect, test } from './fixtures.ts';
import { finishFirstRun, homeRow, openTracker, tab } from './helpers.ts';

const { workout, starters, templates } = messages.tracking;

test('start a workout, log sets that copy the one before, and finish it', async ({ page }) => {
	await finishFirstRun(page);
	await openTracker(page, templates.workouts);

	await page.getByRole('button', { name: workout.start }).click();
	await page.getByRole('button', { name: workout.addExercise }).click();
	await page.getByRole('button', { name: starters.squat }).click();
	await expect(page.getByRole('heading', { name: starters.squat })).toBeVisible();

	await page.getByRole('button', { name: messages.tracking.inputs.more('Weight') }).click();
	await page.getByRole('button', { name: workout.addSet }).click();
	await expect(page.getByRole('timer')).toContainText(/Rest \d/);
	await expect(page.getByRole('textbox').nth(3)).toHaveValue('2.5');

	await page.getByRole('button', { name: workout.finish }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(templates.workouts);
	await expect(page.getByRole('list', { name: workout.past })).toContainText(workout.summary(1, 2));
	await tab(page, messages.navigation.home).click();
	await expect(homeRow(page, templates.workouts)).toContainText('1 workout');
});

test('the rest timer is chosen during the workout and remembered', async ({ page }) => {
	await finishFirstRun(page);
	await openTracker(page, templates.workouts);
	await page.getByRole('button', { name: workout.start }).click();
	const rest = page.getByRole('group', { name: messages.preferences.restTimer });

	await rest.getByRole('button', { name: '3:00' }).click();
	await page.getByRole('button', { name: workout.addExercise }).click();
	await page.getByRole('button', { name: starters.squat }).click();
	await page.getByRole('button', { name: workout.addSet }).click();

	await expect(page.getByRole('timer')).toContainText(/Rest (3:00|2:5\d)/);
	await expect(rest.getByRole('button', { name: '3:00' })).toHaveAttribute('aria-pressed', 'true');
});

test('Home leads back to a workout under way', async ({ page }) => {
	await finishFirstRun(page);
	await openTracker(page, templates.workouts);
	await page.getByRole('button', { name: workout.start }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(workout.title);
	await tab(page, messages.navigation.home).click();

	await page.getByRole('link', { name: /^Resume Workouts/ }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(workout.title);
});

test('a new exercise tracks what it is set to', async ({ page }) => {
	await finishFirstRun(page);
	await openTracker(page, templates.workouts);
	await page.getByRole('button', { name: workout.start }).click();
	await page.getByRole('button', { name: workout.addExercise }).click();
	await page.getByRole('searchbox').fill('Rowing machine');
	await page.getByRole('button', { name: messages.tracking.library.newExercise }).click();
	await expect(page.getByRole('textbox', { name: messages.tracking.library.name })).toHaveValue(
		'Rowing machine'
	);
	await page.getByRole('button', { name: messages.tracking.exerciseFields.cardio }).click();
	await page.getByRole('button', { name: messages.tracking.library.save }).click();

	await page.getByRole('button', { name: 'Rowing machine' }).click();

	await expect(page.getByText(messages.tracking.inputs.minutes).first()).toBeVisible();
	await expect(page.getByText('mi', { exact: true })).toBeVisible();
});
