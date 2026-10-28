import type { Clock } from '../../shared/clock.ts';
import type {
	NutritionDay,
	NutritionTrendQuery,
	WeightTrendPoint,
	WeightTrendQuery
} from './insights-queries.ts';
import type { StatsRange } from './stats-range.constants.ts';
import { rangeStart } from './stats-range.ts';

/** The range to read. */
export interface GetTrendsCommand {
	readonly range: StatsRange;
}

/** Body weight and nutrition over a range, oldest first. */
export interface Trends {
	readonly weight: readonly WeightTrendPoint[];
	readonly nutrition: readonly NutritionDay[];
}

/** What reading trends needs. */
export interface TrendsPorts {
	readonly weight: WeightTrendQuery;
	readonly nutrition: NutritionTrendQuery;
	readonly clock: Clock;
}

/** Reads the weight and nutrition charts for a time range ending today. */
export class GetTrends {
	constructor(private readonly ports: TrendsPorts) {}

	/** @param command - The range to read. */
	async execute(command: GetTrendsCommand): Promise<Trends> {
		const since = rangeStart(command.range, this.ports.clock.today());
		const [weight, nutrition] = await Promise.all([
			this.ports.weight.weightTrend(since),
			this.ports.nutrition.nutritionDays(since)
		]);
		return { weight, nutrition };
	}
}
