import type { NumberField } from '../domain/field.ts';
import type { Tracker } from '../domain/tracker.ts';
import { Dimension, FieldType, TrackerKind } from '../domain/tracking.constants.ts';

/**
 * The fields whose label and unit the user can change: the plain numbers of a
 * log tracker, such as Water's glasses. Food and workouts keep their standard units.
 *
 * @param tracker - The tracker's kind and fields.
 */
export function renamableFields(tracker: Pick<Tracker, 'kind' | 'fields'>): readonly NumberField[] {
	if (tracker.kind !== TrackerKind.log) return [];
	return tracker.fields.filter(
		(field): field is NumberField =>
			field.type === FieldType.number && field.dimension === Dimension.plain
	);
}

/** A number's label and unit as the user edits them on a page. */
export interface RenameDraft {
	readonly key: string;
	label: string;
	unit: string;
}

/**
 * Each renamable field's current label and unit, ready to edit.
 *
 * @param tracker - The tracker's kind and fields.
 */
export function currentRenames(tracker: Pick<Tracker, 'kind' | 'fields'>): RenameDraft[] {
	return renamableFields(tracker).map(({ key, label, unit }) => ({ key, label, unit }));
}
