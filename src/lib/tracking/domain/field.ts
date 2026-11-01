import type { Id } from '../../shared/id.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { Dimension, EntryProblem, FieldProblem, FieldType } from './tracking.constants.ts';

/** The longest label a field can have. */
export const MAX_FIELD_LABEL_LENGTH = 40;

/** The longest unit label a plain number field can have. */
export const MAX_UNIT_LENGTH = 20;

/** The fewest options a choice field offers. */
export const MIN_CHOICE_OPTIONS = 2;

/** The most options a choice field offers. */
export const MAX_CHOICE_OPTIONS = 8;

/** The largest number a number field accepts, in its stored unit. */
export const MAX_NUMBER = 1_000_000_000;

/** The longest duration a field accepts: one week, in seconds. */
export const MAX_DURATION_SECONDS = 604_800;

/** The best rating. Ratings run from 1 to this. */
export const MAX_STARS = 5;

/** The longest note a field accepts. */
export const MAX_NOTE_LENGTH = 2000;

const FIELD_KEY_PATTERN = /^[\da-z][\da-z_-]{0,39}$/;

declare const fieldKeyBrand: unique symbol;

/** Names one field within its tracker, such as `reps` or `weight`. */
export type FieldKey = string & { readonly [fieldKeyBrand]: true };

/** Identifies one stored photo. */
export type PhotoId = Id<'Photo'>;

interface FieldBase {
	readonly key: FieldKey;
	readonly label: string;
	/** Whether every entry must fill this field. */
	readonly required: boolean;
}

/**
 * A number: a plain amount with its own unit label, or a mass or distance
 * shown in the user's units. Masses and distances have an empty unit, because
 * the user's unit setting names them.
 */
export type NumberField = FieldBase & {
	readonly type: typeof FieldType.number;
	readonly dimension: Dimension;
	readonly unit: string;
};

/** One of a few named options. */
export type ChoiceField = FieldBase & {
	readonly type: typeof FieldType.choice;
	readonly options: readonly string[];
};

/** A duration, rating, check, note, or photo, which need nothing beyond their type. */
export type SimpleField = FieldBase & {
	readonly type:
		| typeof FieldType.duration
		| typeof FieldType.rating
		| typeof FieldType.check
		| typeof FieldType.note
		| typeof FieldType.photo;
};

/** A typed slot that each entry of a tracker can fill. */
export type Field = NumberField | ChoiceField | SimpleField;

/**
 * A value filled into one field. Masses are kilograms, distances metres, and
 * durations seconds.
 */
export type FieldValue =
	| { readonly type: typeof FieldType.number; readonly amount: number }
	| { readonly type: typeof FieldType.duration; readonly seconds: number }
	| { readonly type: typeof FieldType.rating; readonly stars: number }
	| { readonly type: typeof FieldType.check }
	| { readonly type: typeof FieldType.choice; readonly option: string }
	| { readonly type: typeof FieldType.note; readonly text: string }
	| { readonly type: typeof FieldType.photo; readonly photoId: PhotoId };

/** A field as entered, before {@link createField} checks its key. */
export type FieldDraft = Field extends infer Each
	? Each extends Field
		? Omit<Each, 'key'> & { readonly key: string }
		: never
	: never;

/** Raised when a field's key, label, unit, or options are invalid. */
export class InvalidField {
	/** @param problem - What was wrong. */
	constructor(readonly problem: FieldProblem) {}
}

/**
 * Whether text can name a field: lowercase letters, digits, `_`, and `-`, up to 40.
 *
 * @param text - The proposed key.
 */
export function isFieldKey(text: string): text is FieldKey {
	return FIELD_KEY_PATTERN.test(text);
}

/**
 * A field key the code names, such as a template's. Throws for a bad key,
 * which is a programmer error.
 *
 * @param text - The key.
 * @throws Error when the text is not a field key.
 */
export function fieldKey(text: string): FieldKey {
	if (!isFieldKey(text)) throw new Error(`Not a field key: ${text}`);
	return text;
}

function tidy(text: string): string {
	return text.trim().replace(/\s+/g, ' ');
}

function tidyOptions(options: readonly string[]): Result<readonly string[], InvalidField> {
	const tidied = options.map(tidy);
	const distinct = new Set(tidied.map((option) => option.toLowerCase()));
	const valid =
		tidied.length >= MIN_CHOICE_OPTIONS &&
		tidied.length <= MAX_CHOICE_OPTIONS &&
		distinct.size === tidied.length &&
		tidied.every((option) => option !== '' && option.length <= MAX_FIELD_LABEL_LENGTH);
	return valid ? ok(tidied) : err(new InvalidField(FieldProblem.options));
}

function tidyNumber(field: NumberField): Result<NumberField, InvalidField> {
	if (field.dimension !== Dimension.plain) return ok({ ...field, unit: '' });
	const unit = tidy(field.unit);
	return unit.length > MAX_UNIT_LENGTH
		? err(new InvalidField(FieldProblem.unit))
		: ok({ ...field, unit });
}

function tidyByType(field: Field): Result<Field, InvalidField> {
	if (field.type === FieldType.number) return tidyNumber(field);
	if (field.type !== FieldType.choice) return ok(field);
	const options = tidyOptions(field.options);
	return options.ok ? ok({ ...field, options: options.value }) : options;
}

/**
 * Creates a field: checks its key, tidies its label, and checks the unit of a
 * plain number or the options of a choice.
 *
 * @param field - The field as entered.
 */
export function createField(field: FieldDraft): Result<Field, InvalidField> {
	const { key } = field;
	if (!isFieldKey(key)) return err(new InvalidField(FieldProblem.key));
	const label = tidy(field.label);
	if (label === '' || label.length > MAX_FIELD_LABEL_LENGTH)
		return err(new InvalidField(FieldProblem.label));
	return tidyByType({ ...field, key, label });
}

/** A plain number field's new label and unit, such as Water in oz instead of Glasses in glasses. */
export interface FieldRename {
	readonly key: string;
	readonly label: string;
	readonly unit: string;
}

function isPlainNumber(field: FieldDraft): boolean {
	return field.type === FieldType.number && field.dimension === Dimension.plain;
}

/**
 * Gives plain number fields new labels and units. Masses, distances, and other
 * fields stay as they are. Logged numbers keep their values under the new unit;
 * pass the result to `createTracker` to check it.
 *
 * @param fields - A tracker's fields.
 * @param renames - The new label and unit of each field to change, by key.
 */
export function renameFields<Each extends FieldDraft>(
	fields: readonly Each[],
	renames: readonly FieldRename[]
): readonly Each[] {
	return fields.map((field) => {
		const rename = renames.find((candidate) => candidate.key === field.key);
		return rename !== undefined && isPlainNumber(field)
			? { ...field, label: rename.label, unit: rename.unit }
			: field;
	});
}

function inRange(amount: number, low: number, high: number): boolean {
	return Number.isFinite(amount) && amount >= low && amount <= high;
}

interface AmountRange {
	readonly low: number;
	readonly high: number;
	readonly whole: boolean;
}

const AMOUNT_RANGES: Partial<Record<FieldType, AmountRange>> = {
	number: { low: 0, high: MAX_NUMBER, whole: false },
	duration: { low: 1, high: MAX_DURATION_SECONDS, whole: true },
	rating: { low: 1, high: MAX_STARS, whole: true }
};

function fitsRange(amount: number | undefined, range: AmountRange | undefined): boolean {
	if (amount === undefined || range === undefined) return true;
	return inRange(amount, range.low, range.high) && (!range.whole || Number.isInteger(amount));
}

function isAccepted(field: Field, value: FieldValue): boolean {
	if (value.type === FieldType.choice)
		return field.type === FieldType.choice && field.options.includes(value.option);
	if (value.type === FieldType.note)
		return value.text !== '' && value.text.length <= MAX_NOTE_LENGTH;
	return fitsRange(numberOf(value), AMOUNT_RANGES[value.type]);
}

/**
 * Checks a value for a field: the types must match, numbers are 0 or more,
 * durations whole seconds above 0, ratings whole stars from 1 to 5, choices one of the
 * field's options, and notes trimmed and not empty.
 *
 * @param field - The field being filled.
 * @param value - The value as entered.
 */
export function checkValue(field: Field, value: FieldValue): Result<FieldValue, EntryProblem> {
	if (value.type !== field.type) return err(EntryProblem.wrongType);
	const tidied = value.type === FieldType.note ? { ...value, text: value.text.trim() } : value;
	return isAccepted(field, tidied) ? ok(tidied) : err(EntryProblem.outOfRange);
}

/**
 * The number a value counts as in totals and averages: the amount, the
 * seconds, or the stars. Other values are not numbers.
 *
 * @param value - A logged value.
 */
export function numberOf(value: FieldValue | undefined): number | undefined {
	if (value?.type === FieldType.number) return value.amount;
	if (value?.type === FieldType.duration) return value.seconds;
	return value?.type === FieldType.rating ? value.stars : undefined;
}
