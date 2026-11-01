import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { checkValue, type Field, type FieldKey, type FieldValue, type PhotoId } from './field.ts';
import type { EntryId, SessionId, SubjectId, TrackerId } from './ids.ts';
import { EntryProblem, FieldType, KIND_RULES, SubjectUse } from './tracking.constants.ts';
import type { Subject } from './subject.ts';
import type { Tracker } from './tracker.ts';

/** One record logged to a tracker on a day. */
export interface Entry {
	readonly id: EntryId;
	readonly trackerId: TrackerId;
	readonly date: LocalDate;
	/** When it was logged, in epoch milliseconds, which orders entries within a day. */
	readonly loggedAt: number;
	/** The exercise, food, or other thing from the tracker's library it is about. */
	readonly subjectId: SubjectId | undefined;
	/** The session, such as a workout, it belongs to. */
	readonly sessionId: SessionId | undefined;
	/** A value for each field the entry fills. */
	readonly values: ReadonlyMap<FieldKey, FieldValue>;
}

/** An entry as entered, before {@link createEntry} checks it against its tracker. */
export type EntryDraft = Omit<Entry, 'trackerId' | 'subjectId'>;

/** Raised when an entry does not fit its tracker. */
export class InvalidEntry {
	/**
	 * @param problem - What was wrong.
	 * @param field - The field at fault, when one is.
	 */
	constructor(
		readonly problem: EntryProblem,
		readonly field?: FieldKey
	) {}
}

function fieldsFor(tracker: Tracker, subject: Subject | undefined): readonly Field[] {
	if (subject === undefined || subject.fieldKeys.length === 0) return tracker.fields;
	return tracker.fields.filter((field) => subject.fieldKeys.includes(field.key));
}

function checkSubject(tracker: Tracker, subject: Subject | undefined): EntryProblem | undefined {
	const use = KIND_RULES[tracker.kind].subjects;
	if (subject === undefined) return use === SubjectUse.required ? EntryProblem.subject : undefined;
	const belongs = use !== SubjectUse.none && subject.trackerId === tracker.id;
	return belongs ? undefined : EntryProblem.subject;
}

function checkValues(
	fields: readonly Field[],
	values: ReadonlyMap<FieldKey, FieldValue>
): Result<ReadonlyMap<FieldKey, FieldValue>, InvalidEntry> {
	if (values.size === 0) return err(new InvalidEntry(EntryProblem.empty));
	const checked = new Map<FieldKey, FieldValue>();
	for (const [key, value] of values) {
		const field = fields.find((candidate) => candidate.key === key);
		if (field === undefined) return err(new InvalidEntry(EntryProblem.unknownField, key));
		const result = checkValue(field, value);
		if (!result.ok) return err(new InvalidEntry(result.error, key));
		checked.set(key, result.value);
	}
	const missing = fields.find((field) => field.required && !checked.has(field.key));
	return missing === undefined
		? ok(checked)
		: err(new InvalidEntry(EntryProblem.missingRequired, missing.key));
}

/**
 * Creates an entry for a tracker. The subject must belong to the tracker and
 * be given exactly when the tracker's kind uses subjects; a subject can narrow
 * the fields its entries fill. Only kinds with sessions take a session. Every
 * value must fit its field, and every required field must be filled.
 *
 * @param tracker - The tracker logged to.
 * @param draft - The entry as entered.
 * @param subject - The exercise, food, or other thing it is about.
 */
export function createEntry(
	tracker: Tracker,
	draft: EntryDraft,
	subject?: Subject
): Result<Entry, InvalidEntry> {
	const subjectProblem = checkSubject(tracker, subject);
	if (subjectProblem !== undefined) return err(new InvalidEntry(subjectProblem));
	const takesSession = KIND_RULES[tracker.kind].sessions;
	if (takesSession !== (draft.sessionId !== undefined))
		return err(new InvalidEntry(EntryProblem.session));
	const values = checkValues(fieldsFor(tracker, subject), draft.values);
	if (!values.ok) return values;
	return ok({ ...draft, trackerId: tracker.id, subjectId: subject?.id, values: values.value });
}

/**
 * The photos an entry holds, whose files go when it does.
 *
 * @param entry - A logged entry.
 */
export function photosOf(entry: Pick<Entry, 'values'>): readonly PhotoId[] {
	return [...entry.values.values()].flatMap((value) =>
		value.type === FieldType.photo ? [value.photoId] : []
	);
}
