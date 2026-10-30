import { messages } from '../../i18n/messages.en.ts';
import { last } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { formatMassNumber, formatMass, formatMonthDay } from '../../ui/format.ts';
import type { ProgressPhoto } from '../domain/progress-photo.ts';
import type { WeighIn } from '../domain/weigh-in.ts';

const ONE_DECIMAL = 1;
const PLUS = '+';
const MINUS = '−';

function signOf(change: number): string {
	if (change > 0) return PLUS;
	return change < 0 ? MINUS : '';
}

/** How weight changed over a span, ready to show. */
export interface WeightChange {
	/** Signed with + or −, one decimal, for example "−3.4". */
	readonly text: string;
	/** Unsigned, one decimal. */
	readonly amount: string;
	readonly direction: 'down' | 'up';
	/** The latest weight, one decimal. */
	readonly latest: string;
}

/**
 * Weigh-ins from a day on, oldest first, in a unit.
 *
 * @param weighIns - Weigh-ins in any order.
 * @param since - The first day to include.
 * @param unit - The unit to show them in.
 */
export function weightsSince(
	weighIns: readonly WeighIn[],
	since: LocalDate,
	unit: MassUnit
): readonly number[] {
	return weighIns
		.filter((weighIn) => !weighIn.date.isBefore(since))
		.toSorted((a, b) => a.date.compareTo(b.date))
		.map((weighIn) => weighIn.weight.toUnit(unit));
}

/**
 * The change from the first to the last of some weights.
 *
 * @param weights - Weights, oldest first.
 */
export function weightChange(weights: readonly number[]): WeightChange {
	const first = weights.at(0) ?? 0;
	const latest = last(weights) ?? 0;
	const change = latest - first;
	const amount = Math.abs(change).toFixed(ONE_DECIMAL);
	return {
		text: `${signOf(change)}${amount}`,
		amount,
		direction: change > 0 ? 'up' : 'down',
		latest: latest.toFixed(ONE_DECIMAL)
	};
}

/**
 * Photos as grid tiles: each captioned with its date and that day's weight.
 *
 * @param photos - Photos, newest first.
 * @param weighIns - Weigh-ins, to find each photo's weight.
 * @param unit - The unit to show weights in.
 */
export function photoTiles(
	photos: readonly ProgressPhoto[],
	weighIns: readonly WeighIn[],
	unit: MassUnit
) {
	return photos.map((photo) => {
		const weighIn = weighIns.find((known) => known.date.equals(photo.date));
		const date = formatMonthDay(photo.date);
		return {
			photo,
			date,
			weight: weighIn === undefined ? '' : formatMassNumber(weighIn.weight, unit),
			alt:
				weighIn === undefined
					? messages.checkIn.comparePhotoAlt(date)
					: messages.checkIn.photoAlt(date, formatMass(weighIn.weight, unit))
		};
	});
}
