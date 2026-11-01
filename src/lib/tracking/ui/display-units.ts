import { messages } from '../../i18n/messages.en.ts';
import { Distance } from '../../shared/distance.ts';
import type { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import type { NumberField } from '../domain/field.ts';
import { Dimension } from '../domain/tracking.constants.ts';

/** The units the user reads masses and distances in. */
export interface DisplayUnits {
	readonly mass: MassUnit;
	readonly distance: DistanceUnit;
}

/**
 * A stored number in the user's units: kilograms as pounds, metres as miles or kilometres.
 *
 * @param field - The number's field.
 * @param stored - The stored amount.
 * @param units - The user's units.
 */
export function toShown(field: NumberField, stored: number, units: DisplayUnits): number {
	if (field.dimension === Dimension.mass) {
		const mass = Mass.fromKg(stored);
		return mass.ok ? mass.value.toUnit(units.mass) : stored;
	}
	if (field.dimension === Dimension.distance) {
		const distance = Distance.fromMeters(stored);
		return distance.ok ? distance.value.toUnit(units.distance) : stored;
	}
	return stored;
}

/**
 * A number the user typed, in the unit it is stored in.
 *
 * @param field - The number's field.
 * @param shown - The amount in the user's units.
 * @param units - The user's units.
 */
export function toStored(field: NumberField, shown: number, units: DisplayUnits): number {
	if (field.dimension === Dimension.mass) {
		const mass = Mass.of(shown, units.mass);
		return mass.ok ? mass.value.kilograms : shown;
	}
	if (field.dimension === Dimension.distance) {
		const distance = Distance.of(shown, units.distance);
		return distance.ok ? distance.value.meters : shown;
	}
	return shown;
}

/**
 * The unit a number field is shown in, such as "glasses", "kg", or "mi".
 *
 * @param field - The number's field.
 * @param units - The user's units.
 */
export function unitText(field: NumberField, units: DisplayUnits): string {
	if (field.dimension === Dimension.mass)
		return units.mass === MassUnit.kg ? messages.units.kg : messages.units.lb;
	return field.dimension === Dimension.distance ? units.distance : field.unit;
}
