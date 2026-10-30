import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { WeighIn } from '../domain/weigh-in.ts';

/**
 * The latest weigh-ins' weights for a sparkline, oldest first, in the user's unit.
 *
 * @param weighIns - Weigh-ins in any order.
 * @param unit - The unit to plot in.
 * @param count - How many of the latest weigh-ins to keep.
 */
export function recentWeights(
	weighIns: readonly WeighIn[],
	unit: MassUnit,
	count: number
): readonly number[] {
	return weighIns
		.toSorted((a, b) => a.date.compareTo(b.date))
		.slice(-count)
		.map((weighIn) => weighIn.weight.toUnit(unit));
}
