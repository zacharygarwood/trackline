import type { WeekStart } from '../../shared/week-start.constants.ts';
import type { ListStats, TrackerSeries } from '../application/progress.ts';

/** State of Stats: a chart for every tracker with a goal. */
export class StatsScreen {
	charts: readonly TrackerSeries[] | undefined = $state();

	constructor(private readonly listStats: ListStats) {}

	/**
	 * Reads every chart.
	 *
	 * @param weekStart - The day weeks begin on.
	 */
	async load(weekStart: WeekStart): Promise<void> {
		this.charts = await this.listStats.execute({ weekStart });
	}
}
