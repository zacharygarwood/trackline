import { messages } from '../../i18n/messages.en.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { parseDecimal } from '../../ui/format.ts';
import type { Field, FieldKey, FieldValue, NumberField } from '../domain/field.ts';
import { Dimension, FieldType } from '../domain/tracking.constants.ts';
import { toShown, toStored, type DisplayUnits } from './display-units.ts';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const KG_STEP = 2.5;
const LB_STEP = 5;
const DISTANCE_STEP = 0.5;
const SHOWN_DECIMALS = 100;

/** What the user has typed or picked for one field, before it becomes a value. */
export type FieldDraft =
	| { type: typeof FieldType.number; text: string }
	| { type: typeof FieldType.duration; hours: string; minutes: string; seconds: string }
	| { type: typeof FieldType.note; text: string }
	| {
			type:
				| typeof FieldType.rating
				| typeof FieldType.check
				| typeof FieldType.choice
				| typeof FieldType.photo;
			/** The rating, check, option, or photo picked, if any. */
			picked: FieldValue | undefined;
	  };

/** Why a form's values cannot be logged, in words for the page. */
export class FormProblem {
	/** @param message - What to fix. */
	constructor(readonly message: string) {}
}

/**
 * A number as the form shows it: at most two decimals, no trailing zeros.
 *
 * @param amount - The number in the user's units.
 */
export function shownText(amount: number): string {
	return String(Math.round(amount * SHOWN_DECIMALS) / SHOWN_DECIMALS);
}

function durationDraft(seconds: number): FieldDraft {
	const part = (amount: number) => (amount === 0 ? '' : String(amount));
	return {
		type: FieldType.duration,
		hours: part(Math.floor(seconds / SECONDS_PER_HOUR)),
		minutes: part(Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)),
		seconds: part(seconds % SECONDS_PER_MINUTE)
	};
}

function measuredDraft(field: Field, value: FieldValue | undefined, units: DisplayUnits) {
	if (field.type === FieldType.number) {
		const amount = value?.type === FieldType.number ? value.amount : undefined;
		const text = amount === undefined ? '' : shownText(toShown(field, amount, units));
		return { type: FieldType.number, text } as const;
	}
	return durationDraft(value?.type === FieldType.duration ? value.seconds : 0);
}

/**
 * A field's starting draft. Numbers and durations start from the given value,
 * such as the last entry's; a required check starts done; the rest start empty.
 *
 * @param field - The field.
 * @param value - The value to start from.
 * @param units - The user's units.
 */
export function draftOf(
	field: Field,
	value: FieldValue | undefined,
	units: DisplayUnits
): FieldDraft {
	if (field.type === FieldType.number || field.type === FieldType.duration)
		return measuredDraft(field, value, units);
	if (field.type === FieldType.note) return { type: field.type, text: '' };
	const done = field.type === FieldType.check && field.required;
	return { type: field.type, picked: done ? { type: FieldType.check } : undefined };
}

/**
 * How much the − and + buttons change a number: 1, or 2.5 kg, 5 lb, or half a
 * kilometre or mile.
 *
 * @param field - The number's field.
 * @param units - The user's units.
 */
export function stepOf(field: NumberField, units: DisplayUnits): number {
	if (field.dimension === Dimension.mass) return units.mass === MassUnit.kg ? KG_STEP : LB_STEP;
	return field.dimension === Dimension.distance ? DISTANCE_STEP : 1;
}

const isBlank = (text: string) => text.trim() === '';

type Parsed = Result<FieldValue | undefined, undefined>;

function parseNumber(field: Field, text: string, units: DisplayUnits): Parsed {
	if (isBlank(text) || field.type !== FieldType.number) return ok(undefined);
	const shown = parseDecimal(text);
	return shown === undefined
		? err(undefined)
		: ok({ type: FieldType.number, amount: toStored(field, shown, units) });
}

function parseDuration(parts: readonly string[]): Parsed {
	if (parts.every(isBlank)) return ok(undefined);
	const numbers = parts.map((part) => (isBlank(part) ? 0 : parseDecimal(part)));
	const [hours, minutes, seconds] = numbers;
	if (hours === undefined || minutes === undefined || seconds === undefined) return err(undefined);
	const total = hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
	return ok({ type: FieldType.duration, seconds: Math.round(total) });
}

/**
 * The value a draft holds: undefined when it is empty, or an error when it is
 * not a number or a duration.
 *
 * @param field - The draft's field.
 * @param draft - What was typed or picked.
 * @param units - The user's units.
 */
export function parseDraft(field: Field, draft: FieldDraft, units: DisplayUnits): Parsed {
	if (draft.type === FieldType.number) return parseNumber(field, draft.text, units);
	if (draft.type === FieldType.duration)
		return parseDuration([draft.hours, draft.minutes, draft.seconds]);
	if (draft.type === FieldType.note)
		return ok(isBlank(draft.text) ? undefined : { type: FieldType.note, text: draft.text.trim() });
	return ok(draft.picked);
}

/**
 * The values of filled drafts, by field, or what to fix first: a number that
 * is not one, a required field left empty, or nothing filled at all.
 *
 * @param fields - The fields, in order.
 * @param drafts - Each field's draft, by key.
 * @param units - The user's units.
 */
export function valuesOf(
	fields: readonly Field[],
	drafts: Readonly<Record<string, FieldDraft>>,
	units: DisplayUnits
): Result<ReadonlyMap<FieldKey, FieldValue>, FormProblem> {
	const values = new Map<FieldKey, FieldValue>();
	for (const field of fields) {
		const draft = drafts[field.key] ?? draftOf(field, undefined, units);
		const value = parseDraft(field, draft, units);
		if (!value.ok) return err(new FormProblem(messages.tracking.page.fixProblem));
		if (value.value === undefined && field.required)
			return err(new FormProblem(messages.tracking.page.fillRequired(field.label)));
		if (value.value !== undefined) values.set(field.key, value.value);
	}
	return values.size === 0 ? err(new FormProblem(messages.tracking.page.fixProblem)) : ok(values);
}

/**
 * Values that fill one field only, such as a check or a portion's servings.
 *
 * @param key - The field.
 * @param value - Its value.
 */
export function onlyValue(key: FieldKey, value: FieldValue): ReadonlyMap<FieldKey, FieldValue> {
	return new Map([[key, value]]);
}
