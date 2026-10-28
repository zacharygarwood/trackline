import { HeatmapShade } from '../../design/heatmap.constants.ts';
import { messages } from '../../i18n/messages.en.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { ActivityDays } from '../application/insights-queries.ts';

/** A legend entry: what a filled or muted day means. */
export interface HeatmapLegendEntry {
	readonly shade: HeatmapShade;
	readonly label: string;
}

/** One activity heatmap: its title, how each day is filled, and what it shows in words. */
export interface ActivityHeatmap {
	readonly title: string;
	readonly shadeOf: (date: LocalDate) => HeatmapShade;
	readonly summary: string;
	readonly legend: readonly HeatmapLegendEntry[];
}

function daySet(dates: readonly LocalDate[]): ReadonlySet<string> {
	return new Set(dates.map((date) => date.toString()));
}

function filledOn(dates: readonly LocalDate[]): (date: LocalDate) => HeatmapShade {
	const days = daySet(dates);
	return (date) => (days.has(date.toString()) ? HeatmapShade.full : HeatmapShade.empty);
}

function trainingShade(days: ActivityDays): (date: LocalDate) => HeatmapShade {
	const trained = filledOn(days.trained);
	const rested = daySet(days.rested);
	return (date) => {
		const shade = trained(date);
		return shade === HeatmapShade.empty && rested.has(date.toString()) ? HeatmapShade.muted : shade;
	};
}

/**
 * The three activity heatmaps: training (rest days muted), food logged, and
 * protein goal met.
 *
 * @param days - The last 52 weeks of activity.
 */
export function activityHeatmaps(days: ActivityDays): readonly ActivityHeatmap[] {
	return [
		{
			title: messages.stats.training,
			shadeOf: trainingShade(days),
			summary: messages.stats.trainingHeatmap(days.trained.length, days.rested.length),
			legend: [
				{ shade: HeatmapShade.full, label: messages.stats.workout },
				{ shade: HeatmapShade.muted, label: messages.stats.restDay }
			]
		},
		{
			title: messages.stats.foodLogged,
			shadeOf: filledOn(days.foodLogged),
			summary: messages.stats.foodHeatmap(days.foodLogged.length),
			legend: []
		},
		{
			title: messages.stats.proteinGoalMet,
			shadeOf: filledOn(days.proteinGoalMet),
			summary: messages.stats.proteinHeatmap(days.proteinGoalMet.length),
			legend: []
		}
	];
}
