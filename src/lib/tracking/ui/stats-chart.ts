import { messages } from '../../i18n/messages.en.ts';
import type { TrackerSeries } from '../application/progress.ts';
import { GoalType } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import { ChartType } from './stats-chart.constants.ts';
import { progressText } from './value-format.ts';

const TREND_PADDING_SHARE = 0.1;

/** How Stats draws one tracker: bars toward a goal each period, or a line toward a target. */
export type StatsChart =
	| {
			readonly type: typeof ChartType.bars;
			readonly values: readonly number[];
			readonly scale: number;
			readonly goal: number;
			readonly summary: string;
	  }
	| {
			readonly type: typeof ChartType.line;
			readonly values: readonly number[];
			readonly padding: number;
			readonly summary: string;
	  }
	| { readonly type: typeof ChartType.none };

/**
 * What Stats draws for a tracker's series, with a text summary for screen readers.
 *
 * @param series - The tracker, its goal, and its values.
 * @param units - The user's units.
 */
export function statsChart(series: TrackerSeries, units: DisplayUnits): StatsChart {
	const { tracker, goal, values } = series;
	if (values.length === 0) return { type: ChartType.none };
	const summary = messages.tracking.stats.summary(
		tracker.name,
		values.map((value) => progressText(tracker, value, units)).join(', ')
	);
	if (goal.type === GoalType.target) {
		const span = Math.max(...values, goal.target) - Math.min(...values, goal.target);
		const padding = span > 0 ? span * TREND_PADDING_SHARE : 1;
		return { type: ChartType.line, values, padding, summary };
	}
	return {
		type: ChartType.bars,
		values,
		scale: Math.max(...values, goal.target),
		goal: goal.target,
		summary
	};
}
