import { err, ok, type Result } from '../../shared/result.ts';
import { createField, type Field, type FieldDraft, type FieldKey } from './field.ts';
import { checkGoal, type Goal } from './goal.ts';
import type { TrackerId } from './ids.ts';
import {
	KIND_RULES,
	TrackerProblem,
	type FieldProblem,
	type TrackerIcon,
	type TrackerKind
} from './tracking.constants.ts';

/** The longest name a tracker can have. */
export const MAX_NAME_LENGTH = 40;

/** The longest name a thing in a library can have, long enough for a food from the food database. */
export const MAX_SUBJECT_NAME_LENGTH = 240;

/** The most fields a tracker can have. */
export const MAX_FIELDS = 8;

/** Something the user tracks: what each entry holds, which page it opens, and what it aims for. */
export interface Tracker {
	readonly id: TrackerId;
	readonly name: string;
	readonly icon: TrackerIcon;
	readonly kind: TrackerKind;
	/** Where it appears on Home, starting at 0. */
	readonly position: number;
	/** What each entry can hold, in the order the tracker's page shows them. */
	readonly fields: readonly Field[];
	/** What its bar on Home fills toward; every tracker has one. */
	readonly goal: Goal;
}

/** A tracker as entered, before {@link createTracker} checks it. */
export type TrackerDraft = Omit<Tracker, 'fields'> & { readonly fields: readonly FieldDraft[] };

/** Raised when a tracker's name, fields, or goal are invalid. */
export class InvalidTracker {
	/**
	 * @param problem - What was wrong.
	 * @param field - The field at fault, when one is.
	 */
	constructor(
		readonly problem: TrackerProblem | FieldProblem,
		readonly field?: string
	) {}
}

/**
 * Tidies a name: trims it and collapses inner spaces. Undefined when the
 * result is empty or too long.
 *
 * @param name - The name as entered.
 * @param longest - The most characters it may have.
 */
export function tidyName(name: string, longest = MAX_NAME_LENGTH): string | undefined {
	const tidied = name.trim().replace(/\s+/g, ' ');
	return tidied === '' || tidied.length > longest ? undefined : tidied;
}

function checkFields(drafts: readonly FieldDraft[]): Result<readonly Field[], InvalidTracker> {
	if (drafts.length === 0) return err(new InvalidTracker(TrackerProblem.noFields));
	if (drafts.length > MAX_FIELDS) return err(new InvalidTracker(TrackerProblem.tooManyFields));
	const fields: Field[] = [];
	for (const draft of drafts) {
		const field = createField(draft);
		if (!field.ok) return err(new InvalidTracker(field.error.problem, draft.key));
		if (fields.some((other) => other.key === field.value.key))
			return err(new InvalidTracker(TrackerProblem.duplicateField, draft.key));
		fields.push(field.value);
	}
	return ok(fields);
}

/**
 * Creates a tracker: tidies its name, checks every field and that their keys
 * are unique, checks that it has the field its kind needs (a photo for photo
 * trackers, a number for food), and checks its goal.
 *
 * @param draft - The tracker as entered.
 */
export function createTracker(draft: TrackerDraft): Result<Tracker, InvalidTracker> {
	const name = tidyName(draft.name);
	if (name === undefined) return err(new InvalidTracker(TrackerProblem.name));
	const fields = checkFields(draft.fields);
	if (!fields.ok) return fields;
	const needs = KIND_RULES[draft.kind].needs;
	if (needs !== undefined && !fields.value.some((field) => field.type === needs))
		return err(new InvalidTracker(TrackerProblem.missingField));
	if (!checkGoal(draft.goal, fields.value, draft.kind).ok)
		return err(new InvalidTracker(TrackerProblem.goal));
	return ok({ ...draft, name, fields: fields.value });
}

/**
 * The tracker's field with a key, if it has one.
 *
 * @param tracker - The tracker.
 * @param key - The field's key.
 */
export function fieldOf(tracker: Tracker, key: FieldKey): Field | undefined {
	return tracker.fields.find((field) => field.key === key);
}
