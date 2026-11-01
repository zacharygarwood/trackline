import type { Result } from '../../shared/result.ts';
import type { Field, FieldKey, FieldValue } from '../domain/field.ts';
import type { DisplayUnits } from './display-units.ts';
import { draftOf, valuesOf, type FieldDraft, type FormProblem } from './entry-drafts.ts';

/**
 * The state of a form that fills a tracker's fields, one input per field.
 * Numbers and durations start from the values given, such as the last entry's,
 * so logging the same again is one tap.
 */
export class EntryForm {
	drafts: Record<string, FieldDraft> = $state({});

	/**
	 * @param fields - The fields to fill, in order.
	 * @param units - The user's units.
	 * @param start - Values to start from, by field.
	 */
	constructor(
		readonly fields: readonly Field[],
		private readonly units: DisplayUnits,
		start?: ReadonlyMap<FieldKey, FieldValue>
	) {
		this.drafts = Object.fromEntries(
			fields.map((field) => [field.key, draftOf(field, start?.get(field.key), units)])
		);
	}

	/** The filled values, by field, or what to fix first. */
	values(): Result<ReadonlyMap<FieldKey, FieldValue>, FormProblem> {
		return valuesOf(this.fields, this.drafts, this.units);
	}
}
