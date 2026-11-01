import { messages } from '../../i18n/messages.en.ts';
import type { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Distance } from '../../shared/distance.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import { unitLabel } from '../../ui/format.ts';
import { Direction, Measure } from '../domain/tracker.constants.ts';
import type { Tracker } from '../domain/tracker.ts';

/** The units the user reads distances and weights in. */
export interface TrackerUnits {
	readonly mass: MassUnit;
	readonly distance: DistanceUnit;
}

const oneDecimal = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });

/** Measures shown as whole numbers, as the food log shows them. */
const WHOLE_MEASURES: readonly Measure[] = [
	Measure.calories,
	Measure.protein,
	Measure.carbs,
	Measure.fat
];

/**
 * A tracker number as the user reads it: metres in their distance unit,
 * kilograms in their weight unit, everything else as stored.
 *
 * @param measure - What the number measures.
 * @param stored - The number as stored.
 * @param units - The user's units.
 */
export function toShown(measure: Measure, stored: number, units: TrackerUnits): number {
	if (measure === Measure.distance) {
		const distance = Distance.fromMeters(stored);
		return distance.ok ? distance.value.toUnit(units.distance) : stored;
	}
	if (measure === Measure.weight) {
		const mass = Mass.fromKg(stored);
		return mass.ok ? mass.value.toUnit(units.mass) : stored;
	}
	return stored;
}

/**
 * A number the user typed, as stored: the reverse of {@link toShown}.
 *
 * @param measure - What the number measures.
 * @param shown - The number as typed.
 * @param units - The user's units.
 */
export function toStored(measure: Measure, shown: number, units: TrackerUnits): number {
	if (measure === Measure.distance) {
		const distance = Distance.of(shown, units.distance);
		return distance.ok ? distance.value.meters : shown;
	}
	if (measure === Measure.weight) {
		const mass = Mass.of(shown, units.mass);
		return mass.ok ? mass.value.kilograms : shown;
	}
	return shown;
}

/**
 * The unit a tracker's numbers are shown in, such as "kcal", "mi", or "glasses".
 *
 * @param tracker - The tracker's measure and its own unit.
 * @param units - The user's units.
 */
export function unitOf(tracker: Pick<Tracker, 'measure' | 'unit'>, units: TrackerUnits): string {
	const { measure } = tracker;
	if (measure === Measure.number || measure === Measure.food) return tracker.unit;
	if (measure === Measure.distance) return units.distance;
	if (measure === Measure.weight) return unitLabel(units.mass);
	return messages.trackers.units[measure];
}

/**
 * A tracker number for display, with at most one decimal.
 *
 * @param value - The number, already in the shown unit.
 */
export function formatTrackerNumber(value: number): string {
	return oneDecimal.format(value);
}

/**
 * A tracker's current value as shown on its bar.
 *
 * @param tracker - The tracker.
 * @param value - Its stored value, or undefined before there is one.
 * @param units - The user's units.
 */
export function valueText(
	tracker: Tracker,
	value: number | undefined,
	units: TrackerUnits
): string {
	if (value === undefined) return messages.trackers.none;
	const shown = toShown(tracker.measure, value, units);
	return formatTrackerNumber(WHOLE_MEASURES.includes(tracker.measure) ? Math.round(shown) : shown);
}

/**
 * The dimmed goal after a tracker's value, such as "/ 2,200 kcal", "/ 2 cups max", or "to 78.0 kg".
 *
 * @param tracker - The tracker.
 * @param units - The user's units.
 */
export function goalText(tracker: Tracker, units: TrackerUnits): string {
	const goal = formatTrackerNumber(toShown(tracker.measure, tracker.goal, units));
	const unit = unitOf(tracker, units);
	if (tracker.measure === Measure.weight) return messages.trackers.toward(goal, unit);
	return tracker.direction === Direction.atMost
		? messages.trackers.atMost(goal, unit)
		: messages.trackers.atLeast(goal, unit);
}
