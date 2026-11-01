import type { App } from '#lib/app/container.ts';
import { directionToward } from '#lib/body/ui/weight-progress.ts';
import type { DailyGoals } from '#lib/nutrition/domain/daily-goals.ts';
import type { HomeTracker } from '#lib/settings/domain/preferences.constants.ts';
import type { AppPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
import { first } from '#lib/shared/collections.ts';
import { Mass } from '#lib/shared/mass.ts';
import type { TrackerProgress } from '#lib/trackers/application/list-tracker-progress.ts';
import type { SaveTrackerCommand } from '#lib/trackers/application/save-tracker.ts';
import { Measure, Period, type MacroMeasure } from '#lib/trackers/domain/tracker.constants.ts';
import type { Tracker } from '#lib/trackers/domain/tracker.ts';
import { PRESETS } from '#lib/trackers/ui/tracker-presets.ts';
import { messages } from '#lib/i18n/messages.en.ts';

const isMacro = (measure: Measure): measure is MacroMeasure =>
	measure === Measure.calories ||
	measure === Measure.protein ||
	measure === Measure.carbs ||
	measure === Measure.fat;

/** The goal a starting tracker begins with: the user's goal if set, else the preset's. */
interface StartingGoals {
	readonly daily: DailyGoals | undefined;
	readonly weeklyWorkouts: number;
	readonly weightKg: number | undefined;
}

function startingTracker(tracker: HomeTracker, goals: StartingGoals): SaveTrackerCommand[] {
	const preset = PRESETS[tracker];
	const base = { ...preset, subjectId: undefined, name: messages.trackers.presets[tracker] };
	if (tracker === Measure.weight) {
		return goals.weightKg === undefined ? [] : [{ ...base, goal: goals.weightKg }];
	}
	if (tracker === Measure.workouts) return [{ ...base, goal: goals.weeklyWorkouts }];
	const daily = goals.daily?.targets[tracker] ?? 0;
	return [{ ...base, goal: daily > 0 ? daily : preset.goal }];
}

/**
 * Makes the starting trackers once, after Welcome: the bars Home showed
 * before trackers existed, with the goals the user already set.
 *
 * @param app - The running app.
 * @param preferences - The user's preferences.
 */
async function seedStartingTrackers(app: App, preferences: AppPreferences): Promise<void> {
	if (!(await app.settings.getSetupStatus.execute())) return;
	const [daily, weight] = await Promise.all([
		app.nutrition.getDailyGoals.execute({ date: app.clock.today() }),
		app.body.getWeightGoal.execute()
	]);
	const goals = {
		daily,
		weeklyWorkouts: preferences.current.weeklyWorkoutGoal,
		weightKg: weight?.target.kilograms
	};
	await app.trackers.seedTrackers.execute({
		trackers: preferences.current.homeTrackers.flatMap((tracker) => startingTracker(tracker, goals))
	});
}

/**
 * Every tracker with its progress, making the starting trackers first if needed.
 *
 * @param app - The running app.
 * @param preferences - The user's preferences.
 */
export async function loadTrackers(
	app: App,
	preferences: AppPreferences
): Promise<readonly TrackerProgress[]> {
	await seedStartingTrackers(app, preferences);
	return app.trackers.listTrackerProgress.execute({ weekStart: preferences.weekStart });
}

/**
 * Copies a saved tracker's goal to where the rest of the app reads it: a daily
 * calorie or macro goal to the food goals, and a weight goal to the weight goal.
 *
 * @param app - The running app.
 * @param tracker - The tracker just saved.
 */
export async function shareGoal(app: App, tracker: Tracker): Promise<void> {
	if (isMacro(tracker.measure) && tracker.period === Period.day) {
		const current = await app.nutrition.getDailyGoals.execute({ date: app.clock.today() });
		const targets = current?.targets ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
		await app.nutrition.setDailyGoals.execute({
			targets: { ...targets, [tracker.measure]: tracker.goal }
		});
		return;
	}
	if (tracker.measure !== Measure.weight) return;
	const target = Mass.fromKg(tracker.goal);
	if (!target.ok) return;
	const latest = first(await app.body.listWeighIns.execute())?.weight.kilograms;
	await app.body.setWeightGoal.execute({
		target: target.value,
		direction: directionToward(latest, tracker.goal)
	});
}
