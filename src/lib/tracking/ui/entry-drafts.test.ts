import { describe, expect, it } from 'vitest';
import { aField, aKey, aNumberField } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import {
	createField,
	type FieldDraft as FieldDefinition,
	type NumberField
} from '../domain/field.ts';
import { Dimension, FieldType } from '../domain/tracking.constants.ts';
import { draftOf, onlyValue, stepOf, valuesOf, type FieldDraft } from './entry-drafts.ts';

const kg = { mass: MassUnit.kg, distance: DistanceUnit.km };
const lb = { mass: MassUnit.lb, distance: DistanceUnit.mi };
const made = (definition: FieldDefinition) => expectOk(createField(definition));

describe('draftOf', () => {
	it('starts numbers in the user’s units and durations split into hours, minutes, and seconds', () => {
		const weight = made(aNumberField({ key: 'weight', dimension: Dimension.mass }));

		expect(draftOf(weight, { type: FieldType.number, amount: 100 }, lb)).toEqual({
			type: FieldType.number,
			text: '220.46'
		});
		expect(draftOf(made(aField()), { type: FieldType.duration, seconds: 3725 }, kg)).toEqual({
			type: FieldType.duration,
			hours: '1',
			minutes: '2',
			seconds: '5'
		});
	});

	it('starts a required check done and everything else empty', () => {
		expect(draftOf(made(aField({ type: FieldType.check, required: true })), undefined, kg)).toEqual(
			{
				type: FieldType.check,
				picked: { type: FieldType.check }
			}
		);
		expect(draftOf(made(aField({ type: FieldType.note })), undefined, kg)).toEqual({
			type: FieldType.note,
			text: ''
		});
		expect(draftOf(made(aField({ type: FieldType.rating })), undefined, kg)).toEqual({
			type: FieldType.rating,
			picked: undefined
		});
	});
});

describe('stepOf', () => {
	it.each([
		[Dimension.plain, kg, 1],
		[Dimension.mass, kg, 2.5],
		[Dimension.mass, lb, 5],
		[Dimension.distance, kg, 0.5]
	])('steps a %s number in %o by %d', (dimension, units, step) => {
		const field: NumberField = { ...aNumberField({ dimension }), key: aKey('amount') };

		expect(stepOf(field, units)).toBe(step);
	});
});

describe('valuesOf', () => {
	const glasses = made(aNumberField({ required: true }));
	const time = made(aField());
	const note = made(aField({ type: FieldType.note, key: 'note' }));
	const fields = [glasses, time, note];
	const empty: Record<string, FieldDraft> = {
		amount: { type: FieldType.number, text: '2' },
		time: { type: FieldType.duration, hours: '', minutes: '', seconds: '' },
		note: { type: FieldType.note, text: '' }
	};
	const drafts = (changes: Record<string, FieldDraft>) => ({ ...empty, ...changes });

	it('keeps filled fields, in stored units, and skips empty ones', () => {
		const values = expectOk(
			valuesOf(
				fields,
				drafts({
					time: { type: FieldType.duration, hours: '', minutes: '1,5', seconds: '' },
					note: { type: FieldType.note, text: ' Hot ' }
				}),
				kg
			)
		);

		expect(values).toEqual(
			new Map([
				[aKey('amount'), { type: FieldType.number, amount: 2 }],
				[aKey('time'), { type: FieldType.duration, seconds: 90 }],
				[aKey('note'), { type: FieldType.note, text: 'Hot' }]
			])
		);
	});

	it('names an empty required field, and refuses text that is not a number', () => {
		expect(
			expectErr(valuesOf(fields, drafts({ amount: { type: FieldType.number, text: '' } }), kg))
				.message
		).toBe('Fill in amount.');
		expect(
			expectErr(valuesOf(fields, drafts({ amount: { type: FieldType.number, text: 'two' } }), kg))
				.message
		).toBe('Check the values and try again.');
	});

	it('refuses a form with nothing filled', () => {
		expect(valuesOf([time], {}, kg).ok).toBe(false);
	});
});

describe('onlyValue', () => {
	it('fills one field', () => {
		expect(onlyValue(aKey('done'), { type: FieldType.check })).toEqual(
			new Map([[aKey('done'), { type: FieldType.check }]])
		);
	});
});
