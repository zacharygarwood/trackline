import type { Entry } from '../domain/entry.ts';
import { numberOf, type NumberField } from '../domain/field.ts';
import { servingsFieldOf } from '../domain/portion.ts';
import type { Tracker } from '../domain/tracker.ts';
import { FieldType } from '../domain/tracking.constants.ts';

/** One number field's total over some food entries, such as the day's protein. */
export interface FoodTotal {
	readonly field: NumberField;
	readonly total: number;
}

/**
 * Each number field's total over food entries, servings left out.
 *
 * @param tracker - The food tracker.
 * @param entries - The entries, such as today's.
 */
export function foodTotals(tracker: Tracker, entries: readonly Entry[]): readonly FoodTotal[] {
	const servings = servingsFieldOf(tracker.fields);
	return tracker.fields
		.filter(
			(field): field is NumberField =>
				field.type === FieldType.number && field.key !== servings?.key
		)
		.map((field) => ({
			field,
			total: entries.reduce((sum, entry) => sum + (numberOf(entry.values.get(field.key)) ?? 0), 0)
		}));
}
