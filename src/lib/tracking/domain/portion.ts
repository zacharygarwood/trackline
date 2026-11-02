import type { Field, FieldKey, FieldValue, NumberField } from './field.ts';
import type { Subject } from './subject.ts';
import { FieldType } from './tracking.constants.ts';

/**
 * What logging a portion of a food records: the food's numbers per serving
 * times the servings eaten, its other defaults as they are, and the servings.
 * The entry keeps these values, so editing the food later never rewrites it.
 *
 * @param food - The food, whose defaults are per serving.
 * @param servingsField - The field that holds the servings eaten.
 * @param servings - How many servings were eaten.
 */
export function portionValues(
	food: Pick<Subject, 'defaults'>,
	servingsField: FieldKey,
	servings: number
): ReadonlyMap<FieldKey, FieldValue> {
	const values = new Map<FieldKey, FieldValue>();
	for (const [key, value] of food.defaults) {
		values.set(
			key,
			value.type === FieldType.number ? { ...value, amount: value.amount * servings } : value
		);
	}
	values.set(servingsField, { type: FieldType.number, amount: servings });
	return values;
}

/**
 * The field a food tracker records servings in: its first number field.
 *
 * @param fields - The food tracker's fields.
 */
export function servingsFieldOf(fields: readonly Field[]): NumberField | undefined {
	return fields.find((field): field is NumberField => field.type === FieldType.number);
}
