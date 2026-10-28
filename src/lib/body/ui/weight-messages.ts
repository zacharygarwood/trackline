import { messages } from '../../i18n/messages.en.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import { formatMass } from '../../ui/format.ts';
import { MAX_BODY_WEIGHT_KG, MIN_BODY_WEIGHT_KG } from '../domain/weigh-in.ts';

/**
 * Tells the user the accepted body weight range, in their unit.
 *
 * @param unit - The unit the user enters weights in.
 */
export function weightOutOfRangeMessage(unit: MassUnit): string {
	const bound = (kilograms: number) => {
		const mass = Mass.fromKg(kilograms);
		return mass.ok ? formatMass(mass.value, unit) : '';
	};
	return messages.body.weightOutOfRange(bound(MIN_BODY_WEIGHT_KG), bound(MAX_BODY_WEIGHT_KG));
}
