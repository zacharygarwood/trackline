import { err, ok, type Result } from '../../shared/result.ts';
import { checkValue, type FieldKey, type FieldValue } from './field.ts';
import type { SubjectId, TrackerId } from './ids.ts';
import { KIND_RULES, SubjectProblem, SubjectUse } from './tracking.constants.ts';
import { fieldOf, tidyName, type Tracker } from './tracker.ts';

/** A thing in a tracker's library that entries are about, such as an exercise, a food, or a plant. */
export interface Subject {
	readonly id: SubjectId;
	readonly trackerId: TrackerId;
	readonly name: string;
	/** The fields its entries fill, in the tracker's order; empty means all of them. */
	readonly fieldKeys: readonly FieldKey[];
	/** Values its entries start from, such as a food's calories per serving. */
	readonly defaults: ReadonlyMap<FieldKey, FieldValue>;
	/** Whether it was deleted: hidden from the library, but kept for the entries about it. */
	readonly archived: boolean;
}

/** A subject as entered, before {@link createSubject} checks it against its tracker. */
export type SubjectDraft = Omit<Subject, 'trackerId' | 'archived'>;

/** Raised when a subject does not fit its tracker. */
export class InvalidSubject {
	/** @param problem - What was wrong. */
	constructor(readonly problem: SubjectProblem) {}
}

function checkDefaults(
	tracker: Tracker,
	draft: SubjectDraft
): Result<ReadonlyMap<FieldKey, FieldValue>, InvalidSubject> {
	const checked = new Map<FieldKey, FieldValue>();
	for (const [key, value] of draft.defaults) {
		const field = fieldOf(tracker, key);
		const used = draft.fieldKeys.length === 0 || draft.fieldKeys.includes(key);
		const result = field === undefined || !used ? undefined : checkValue(field, value);
		if (result?.ok !== true) return err(new InvalidSubject(SubjectProblem.defaults));
		checked.set(key, result.value);
	}
	return ok(checked);
}

/**
 * Creates a thing in a tracker's library: tidies its name, keeps the fields it
 * uses in the tracker's order, and checks its default values against those
 * fields. Only kinds with subjects have a library.
 *
 * @param tracker - The tracker whose library it joins.
 * @param draft - The subject as entered.
 */
export function createSubject(
	tracker: Tracker,
	draft: SubjectDraft
): Result<Subject, InvalidSubject> {
	if (KIND_RULES[tracker.kind].subjects === SubjectUse.none)
		return err(new InvalidSubject(SubjectProblem.notUsed));
	const name = tidyName(draft.name);
	if (name === undefined) return err(new InvalidSubject(SubjectProblem.name));
	if (draft.fieldKeys.some((key) => fieldOf(tracker, key) === undefined))
		return err(new InvalidSubject(SubjectProblem.fields));
	const fieldKeys = tracker.fields
		.map((field) => field.key)
		.filter((key) => draft.fieldKeys.includes(key));
	const defaults = checkDefaults(tracker, draft);
	if (!defaults.ok) return defaults;
	return ok({
		...draft,
		trackerId: tracker.id,
		name,
		fieldKeys,
		defaults: defaults.value,
		archived: false
	});
}
