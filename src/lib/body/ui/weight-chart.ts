import { messages } from '../../i18n/messages.en.ts';
import type { ChartPoint } from '../../design/line-chart.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { last } from '../../shared/collections.ts';
import { formatMass } from '../../ui/format.ts';
import type { WeightGoal } from '../domain/weight-goal.ts';
import { movingAverage, type TrendPoint } from '../domain/weight-trend.ts';
import type { WeighIn } from '../domain/weigh-in.ts';

/** What the weight chart draws, in the user's unit. */
export interface WeightChartData {
	readonly points: readonly ChartPoint[];
	readonly trend: readonly ChartPoint[];
	readonly goal: readonly ChartPoint[];
	readonly summary: string;
}

/**
 * Turns weigh-ins into chart data: one dot per weigh-in, the 7-day moving
 * average as a line, and the goal, all in the user's unit.
 *
 * @param weighIns - At least one weigh-in, in any order.
 * @param goal - The active goal, if any.
 * @param unit - The unit to plot in.
 */
export function weightChartData(
	weighIns: readonly WeighIn[],
	goal: WeightGoal | undefined,
	unit: MassUnit
): WeightChartData {
	const trend = movingAverage(weighIns);
	return {
		points: weighIns.map((weighIn) => ({
			x: weighIn.date.toEpochDay(),
			y: weighIn.weight.toUnit(unit)
		})),
		trend: trend.map((point) => ({ x: point.date.toEpochDay(), y: point.weight.toUnit(unit) })),
		goal: goal === undefined ? [] : [{ x: 0, y: goal.target.toUnit(unit) }],
		summary: summarize(weighIns, trend, unit) + goalSummary(goal, unit)
	};
}

function summarize(
	weighIns: readonly WeighIn[],
	trend: readonly TrendPoint[],
	unit: MassUnit
): string {
	const latest = last(trend);
	const newest = last(weighIns.toSorted((a, b) => a.date.compareTo(b.date)));
	if (latest === undefined || newest === undefined) return '';
	return messages.body.chartSummary(
		weighIns.length,
		formatMass(newest.weight, unit),
		formatMass(latest.weight, unit)
	);
}

function goalSummary(goal: WeightGoal | undefined, unit: MassUnit): string {
	return goal === undefined ? '' : messages.body.chartGoal(formatMass(goal.target, unit));
}
