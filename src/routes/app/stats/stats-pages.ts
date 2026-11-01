import { page } from '$app/state';
import type { App } from '#lib/app/container.ts';
import type { CardExercise } from '#lib/insights/ui/exercise-cards.ts';
import { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
import type { TrainOverview } from '#lib/training/ui/train-overview.svelte.ts';
import { countLabel, gradeNames, primaryField } from '#lib/training/ui/workout-format.ts';

/**
 * Loads Stats for a page opened from the Stats tab, on the range the tab was showing.
 *
 * @param app - The running app.
 */
export async function statsForPage(app: App): Promise<StatsScreen> {
	const stats = new StatsScreen(app.insights, app.clock);
	const range = page.state.range;
	await (range === undefined ? stats.load() : stats.choose(range));
	return stats;
}

/**
 * The exercise library as Stats charts it.
 *
 * @param overview - The loaded training overview.
 */
export function cardExercises(overview: TrainOverview): readonly CardExercise[] {
	return overview.library.map((exercise) => ({
		id: exercise.id,
		name: exercise.name,
		measure: primaryField(exercise),
		grades: gradeNames(exercise),
		countLabel: countLabel(exercise)
	}));
}
