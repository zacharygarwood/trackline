import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import type { FieldKey, FieldValue } from './field.ts';
import { portionValues } from './portion.ts';
import type { Subject } from './subject.ts';
import { FieldType } from './tracking.constants.ts';

const number = (amount: number): FieldValue => ({ type: FieldType.number, amount });
const servings = aKey('servings');

const oats: Subject = {
	id: anId<'Subject'>(),
	trackerId: anId<'Tracker'>(),
	name: 'Oats',
	fieldKeys: [],
	defaults: new Map<FieldKey, FieldValue>([
		[aKey('calories'), number(150)],
		[aKey('protein'), number(5)],
		[aKey('note'), { type: FieldType.note, text: 'Rolled' }]
	]),
	archived: false
};

describe('portionValues', () => {
	it('scales a food by the servings eaten and records the servings', () => {
		const values = portionValues(oats, servings, 1.5);

		expect(values.get(aKey('calories'))).toEqual(number(225));
		expect(values.get(aKey('protein'))).toEqual(number(7.5));
		expect(values.get(servings)).toEqual(number(1.5));
	});

	it('copies values that are not numbers', () => {
		expect(portionValues(oats, servings, 2).get(aKey('note'))).toEqual({
			type: FieldType.note,
			text: 'Rolled'
		});
	});
});
