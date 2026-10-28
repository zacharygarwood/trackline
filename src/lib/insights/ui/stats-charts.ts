import type { ChartPoint } from '../../design/line-chart.ts';
import { messages } from '../../i18n/messages.en.ts';
import { elementAt, last } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import { formatMass } from '../../ui/format.ts';
import type {
	ExerciseSession,
	NutritionDay,
	WeightTrendPoint
} from '../application/insights-queries.ts';
import { Nutrient } from './nutrient.constants.ts';

/** What a Stats line chart draws, already in display units. */
export interface StatsChartData {
	readonly points: readonly ChartPoint[];
	readonly trend: readonly ChartPoint[];
	readonly goal: readonly ChartPoint[];
	readonly summary: string;
}

const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

const at = (date: LocalDate, y: number): ChartPoint => ({ x: date.toEpochDay(), y });

const mean = (values: readonly number[]) =>
	values.reduce((sum, value) => sum + value, 0) / values.length;

const heaviestOf = (masses: readonly Mass[]) =>
	masses.reduce((heaviest, mass) => (mass.kilograms > heaviest.kilograms ? mass : heaviest));

/**
 * Weigh-ins as dots and the 7-day moving average as the line.
 *
 * @param trend - Points oldest first.
 * @param unit - The unit to plot in.
 * @returns Undefined when there is nothing to draw.
 */
export function weightChartData(
	trend: readonly WeightTrendPoint[],
	unit: MassUnit
): StatsChartData | undefined {
	const latest = last(trend);
	if (latest === undefined) return undefined;
	return {
		points: trend.map((point) => at(point.date, point.weight.toUnit(unit))),
		trend: trend.map((point) => at(point.date, point.average.toUnit(unit))),
		goal: [],
		summary: messages.body.chartSummary(
			trend.length,
			formatMass(latest.weight, unit),
			formatMass(latest.average, unit)
		)
	};
}

const NUTRIENTS = {
	[Nutrient.calories]: {
		label: messages.stats.calories,
		eaten: (day: NutritionDay) => day.calories,
		goal: (day: NutritionDay) => day.calorieGoal,
		format: (value: number) => messages.nutrition.kcal(whole.format(value))
	},
	[Nutrient.protein]: {
		label: messages.stats.protein,
		eaten: (day: NutritionDay) => day.protein,
		goal: (day: NutritionDay) => day.proteinGoal,
		format: (value: number) => messages.nutrition.grams(whole.format(value))
	}
} as const;

function goalSteps(
	days: readonly NutritionDay[],
	goalOf: (day: NutritionDay) => number | undefined
): readonly ChartPoint[] {
	const withGoals = days.flatMap((day) => {
		const goal = goalOf(day);
		return goal === undefined ? [] : [at(day.date, goal)];
	});
	return withGoals.filter((point, index) => elementAt(withGoals, index - 1)?.y !== point.y);
}

/**
 * Daily totals of one nutrient as a line, with the goals in effect as a step line.
 *
 * @param days - Days with food logged, oldest first.
 * @param nutrient - Calories or protein.
 * @returns Undefined when there is nothing to draw.
 */
export function nutritionChartData(
	days: readonly NutritionDay[],
	nutrient: Nutrient
): StatsChartData | undefined {
	const latest = last(days);
	if (latest === undefined) return undefined;
	const { label, eaten, goal, format } = NUTRIENTS[nutrient];
	const daily = days.map((day) => at(day.date, eaten(day)));
	const latestGoal = goal(latest);
	return {
		points: daily,
		trend: daily,
		goal: goalSteps(days, goal),
		summary:
			messages.stats.nutritionSummary(label, days.length, format(mean(days.map(eaten)))) +
			(latestGoal === undefined ? '' : messages.stats.latestGoal(format(latestGoal)))
	};
}

/**
 * Each day's heaviest set as dots and its estimated one-rep max as the line.
 *
 * @param sessions - Sessions oldest first.
 * @param name - The exercise, for the summary.
 * @param unit - The unit to plot in.
 * @returns Undefined when there is nothing to draw.
 */
export function exerciseChartData(
	sessions: readonly ExerciseSession[],
	name: string,
	unit: MassUnit
): StatsChartData | undefined {
	if (last(sessions) === undefined) return undefined;
	return {
		points: sessions.map((session) => at(session.date, session.heaviest.toUnit(unit))),
		trend: sessions.map((session) => at(session.date, session.estimatedOneRepMax.toUnit(unit))),
		goal: [],
		summary: messages.stats.exerciseSummary({
			name,
			sessions: sessions.length,
			heaviest: formatMass(heaviestOf(sessions.map((session) => session.heaviest)), unit),
			best: formatMass(heaviestOf(sessions.map((session) => session.estimatedOneRepMax)), unit)
		})
	};
}
