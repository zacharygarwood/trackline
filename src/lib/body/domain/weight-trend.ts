import type { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import type { WeighIn } from './weigh-in.ts';

/** How many days, ending on and including each weigh-in's day, the trend averages over. */
const MOVING_AVERAGE_DAYS = 7;

/** The smoothed body weight on a day that has a weigh-in. */
export interface TrendPoint {
	readonly date: LocalDate;
	readonly weight: Mass;
}

/**
 * The 7-day moving average of body weight, which smooths out daily water swings.
 *
 * Each weigh-in day gets the mean of every weigh-in in the seven days ending
 * on that day. Days without a weigh-in get no point.
 *
 * @param weighIns - Weigh-ins in any order.
 * @returns One point per weigh-in, oldest first.
 */
export function movingAverage(weighIns: readonly WeighIn[]): readonly TrendPoint[] {
	const ordered = weighIns.toSorted((a, b) => a.date.compareTo(b.date));
	return ordered.map((weighIn) => ({
		date: weighIn.date,
		weight: averageOf(ordered.filter((other) => isInWindowEndingOn(other.date, weighIn.date)))
	}));
}

function isInWindowEndingOn(date: LocalDate, end: LocalDate): boolean {
	const daysBefore = end.toEpochDay() - date.toEpochDay();
	return daysBefore >= 0 && daysBefore < MOVING_AVERAGE_DAYS;
}

function averageOf(weighIns: readonly WeighIn[]): Mass {
	const total = weighIns.reduce((sum, weighIn) => sum + weighIn.weight.kilograms, 0);
	const result = Mass.fromKg(total / weighIns.length);
	if (!result.ok) throw new Error('A moving average of body weights is always a valid mass');
	return result.value;
}
