import { messages } from '../../i18n/messages.en.ts';
import type { TrackerSeries } from '../application/progress.ts';
import { StatType } from '../domain/tracking.constants.ts';
import type { DisplayUnits } from './display-units.ts';
import { ChartType } from './stats-chart.constants.ts';
import { statText } from './value-format.ts';

const TREND_PADDING_SHARE = 0.1;

/** How Stats draws one tracker: bars each period, toward a goal if it has one, or a trend line. */
export type StatsChart =
	| {
			readonly type: typeof ChartType.bars;
			readonly values: readonly number[];
			readonly scale: number;
			readonly goal: number | undefined;
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
 * @param series - The tracker, what it charts, and its values.
 * @param units - The user's units.
 */
export function statsChart(series: TrackerSeries, units: DisplayUnits): StatsChart {
	const { tracker, stat, values } = series;
	if (values.length === 0) return { type: ChartType.none };
	const summary = messages.tracking.stats.summary(
		tracker.name,
		values.map((value) => statText(series, value, units)).join(', ')
	);
	const marks = stat.goal === undefined ? values : [...values, stat.goal];
	if (stat.type === StatType.trend) {
		const span = Math.max(...marks) - Math.min(...marks);
		const padding = span > 0 ? span * TREND_PADDING_SHARE : 1;
		return { type: ChartType.line, values, padding, summary };
	}
	return { type: ChartType.bars, values, scale: Math.max(...marks), goal: stat.goal, summary };
}
