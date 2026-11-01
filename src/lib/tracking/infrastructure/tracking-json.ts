import { isId } from '../../shared/id.ts';
import {
	isFieldKey,
	type FieldDraft,
	type FieldKey,
	type FieldValue,
	type SimpleField
} from '../domain/field.ts';
import type { Goal } from '../domain/goal.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period
} from '../domain/tracking.constants.ts';

type JsonObject = Readonly<Record<string, unknown>>;

/**
 * Parses JSON text, or undefined when it is not JSON.
 *
 * @param text - Stored JSON.
 */
export function parseJson(text: string): unknown {
	try {
		const parsed: unknown = JSON.parse(text);
		return parsed;
	} catch {
		return undefined;
	}
}

function isObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const oneOf =
	<T>(values: readonly T[]) =>
	(value: unknown): T | undefined =>
		values.find((candidate) => candidate === value);

const dimensionOf = oneOf(Object.values(Dimension));
const directionOf = oneOf(Object.values(Direction));
const periodOf = oneOf(Object.values(Period));
const fieldMeasureOf = oneOf([Measure.total, Measure.average] as const);
const countMeasureOf = oneOf([Measure.entries, Measure.days, Measure.sessions] as const);
const simpleTypeOf = oneOf<SimpleField['type']>([
	FieldType.duration,
	FieldType.rating,
	FieldType.check,
	FieldType.note,
	FieldType.photo
]);

const textOf = (value: unknown) => (typeof value === 'string' ? value : undefined);
const numberOf = (value: unknown) => (typeof value === 'number' ? value : undefined);
const keyOf = (value: unknown) => {
	const text = textOf(value);
	return text !== undefined && isFieldKey(text) ? text : undefined;
};

function textsOf(value: unknown): readonly string[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const texts = value.flatMap((item: unknown) => (typeof item === 'string' ? [item] : []));
	return texts.length === value.length ? texts : undefined;
}

function typedFieldOf(raw: JsonObject, base: Omit<SimpleField, 'type' | 'key'> & { key: string }) {
	if (raw.type === FieldType.number) {
		const [dimension, unit] = [dimensionOf(raw.dimension), textOf(raw.unit)];
		return dimension === undefined || unit === undefined
			? undefined
			: { ...base, type: FieldType.number, dimension, unit };
	}
	if (raw.type === FieldType.choice) {
		const options = textsOf(raw.options);
		return options === undefined ? undefined : { ...base, type: FieldType.choice, options };
	}
	const type = simpleTypeOf(raw.type);
	return type === undefined ? undefined : { ...base, type };
}

/**
 * A stored field, checked only for shape; `createTracker` checks the rest.
 *
 * @param raw - One parsed element of a tracker's `fields`.
 */
export function fieldDraftOf(raw: unknown): FieldDraft | undefined {
	if (!isObject(raw)) return undefined;
	const [key, label] = [textOf(raw.key), textOf(raw.label)];
	if (key === undefined || label === undefined || typeof raw.required !== 'boolean')
		return undefined;
	return typedFieldOf(raw, { key, label, required: raw.required });
}

/**
 * Stored fields, or undefined if any is malformed.
 *
 * @param text - A tracker's `fields` column.
 */
export function fieldDraftsOf(text: string): readonly FieldDraft[] | undefined {
	const raw = parseJson(text);
	if (!Array.isArray(raw)) return undefined;
	const fields = raw.flatMap((item: unknown) => {
		const field = fieldDraftOf(item);
		return field === undefined ? [] : [field];
	});
	return fields.length === raw.length ? fields : undefined;
}

function periodGoalOf(raw: JsonObject, target: number): Goal | undefined {
	const [direction, period] = [directionOf(raw.direction), periodOf(raw.period)];
	if (direction === undefined || period === undefined) return undefined;
	const base = { type: GoalType.period, target, direction, period } as const;
	const counted = countMeasureOf(raw.measure);
	if (counted !== undefined) return { ...base, measure: counted };
	const [measure, field] = [fieldMeasureOf(raw.measure), keyOf(raw.field)];
	return measure === undefined || field === undefined ? undefined : { ...base, measure, field };
}

/**
 * A stored goal, checked only for shape, or undefined when malformed.
 *
 * @param text - A tracker's `goal` column.
 */
export function goalOf(text: string): Goal | undefined {
	const raw = parseJson(text);
	if (!isObject(raw)) return undefined;
	const target = numberOf(raw.target);
	if (target === undefined) return undefined;
	if (raw.type === GoalType.period) return periodGoalOf(raw, target);
	const field = keyOf(raw.field);
	return raw.type === GoalType.target && field !== undefined
		? { type: GoalType.target, field, target }
		: undefined;
}

function numericValueOf(raw: JsonObject): FieldValue | undefined {
	const [amount, seconds, stars] = [
		numberOf(raw.amount),
		numberOf(raw.seconds),
		numberOf(raw.stars)
	];
	if (raw.type === FieldType.number && amount !== undefined)
		return { type: FieldType.number, amount };
	if (raw.type === FieldType.duration && seconds !== undefined)
		return { type: FieldType.duration, seconds };
	return raw.type === FieldType.rating && stars !== undefined
		? { type: FieldType.rating, stars }
		: undefined;
}

function textValueOf(raw: JsonObject): FieldValue | undefined {
	const [option, text, photoId] = [textOf(raw.option), textOf(raw.text), textOf(raw.photoId)];
	if (raw.type === FieldType.choice && option !== undefined)
		return { type: FieldType.choice, option };
	if (raw.type === FieldType.note && text !== undefined) return { type: FieldType.note, text };
	return raw.type === FieldType.photo && photoId !== undefined && isId<'Photo'>(photoId)
		? { type: FieldType.photo, photoId }
		: undefined;
}

/**
 * A stored value, checked for shape, or undefined when malformed.
 *
 * @param raw - One parsed value.
 */
export function valueOf(raw: unknown): FieldValue | undefined {
	if (!isObject(raw)) return undefined;
	if (raw.type === FieldType.check) return { type: FieldType.check };
	return numericValueOf(raw) ?? textValueOf(raw);
}

/**
 * Stored values by field key, or undefined if any is malformed.
 *
 * @param text - An entry's `field_values` or a subject's `defaults` column.
 */
export function valuesOf(text: string): ReadonlyMap<FieldKey, FieldValue> | undefined {
	const raw = parseJson(text);
	if (!isObject(raw)) return undefined;
	const values = new Map<FieldKey, FieldValue>();
	for (const [key, item] of Object.entries(raw)) {
		const value = valueOf(item);
		if (!isFieldKey(key) || value === undefined) return undefined;
		values.set(key, value);
	}
	return values;
}

/**
 * Stored field keys, or undefined if any is malformed.
 *
 * @param text - A subject's `field_keys` column.
 */
export function fieldKeysOf(text: string): readonly FieldKey[] | undefined {
	const texts = textsOf(parseJson(text));
	if (texts === undefined) return undefined;
	const keys = texts.filter((key) => isFieldKey(key));
	return keys.length === texts.length ? keys : undefined;
}

/**
 * Values by field key as stored JSON.
 *
 * @param values - The values.
 */
export function valuesJson(values: ReadonlyMap<FieldKey, FieldValue>): string {
	return JSON.stringify(Object.fromEntries(values));
}
