import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aChoiceField, aNumberField, aField } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { checkValue, createField, type FieldDraft, type FieldValue } from './field.ts';
import { Dimension, EntryProblem, FieldProblem, FieldType } from './tracking.constants.ts';

describe('createField', () => {
	it('tidies the label, unit, and options', () => {
		const water = expectOk(
			createField(aNumberField({ label: '  Glasses   of water ', unit: ' glasses ' }))
		);
		const feeling = expectOk(createField(aChoiceField({ options: [' Calm ', 'Busy'] })));

		expect([water.label, water.type === FieldType.number && water.unit]).toEqual([
			'Glasses of water',
			'glasses'
		]);
		expect(feeling.type === FieldType.choice && feeling.options).toEqual(['Calm', 'Busy']);
	});

	it('drops the unit label of masses and distances, which the user picks in Settings', () => {
		const weight = expectOk(createField(aNumberField({ dimension: Dimension.mass, unit: 'kg' })));

		expect(weight.type === FieldType.number && weight.unit).toBe('');
	});

	it.each([
		[aField({ key: 'Not a key' }), FieldProblem.key],
		[aField({ label: '  ' }), FieldProblem.label],
		[aField({ label: 'x'.repeat(41) }), FieldProblem.label],
		[aNumberField({ unit: 'x'.repeat(21) }), FieldProblem.unit],
		[aChoiceField({ options: ['Only one'] }), FieldProblem.options],
		[aChoiceField({ options: ['Same', ' same '] }), FieldProblem.options],
		[aChoiceField({ options: ['A', ''] }), FieldProblem.options],
		[aChoiceField({ options: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] }), FieldProblem.options]
	])('rejects %o', (field, problem) => {
		expect(expectErr(createField(field)).problem).toBe(problem);
	});
});

describe('checkValue', () => {
	const made = (draft: FieldDraft) => expectOk(createField(draft));

	const accepted: [FieldDraft, FieldValue][] = [
		[aNumberField(), { type: FieldType.number, amount: 0 }],
		[aNumberField(), { type: FieldType.number, amount: 2.5 }],
		[aField({ type: FieldType.duration }), { type: FieldType.duration, seconds: 600 }],
		[aField({ type: FieldType.rating }), { type: FieldType.rating, stars: 5 }],
		[aField({ type: FieldType.check }), { type: FieldType.check }],
		[aChoiceField(), { type: FieldType.choice, option: 'Calm' }],
		[aField({ type: FieldType.photo }), { type: FieldType.photo, photoId: anId<'Photo'>() }]
	];

	it.each(accepted)('accepts %o with %o', (field, value) => {
		expect(expectOk(checkValue(made(field), value))).toEqual(value);
	});

	it('trims notes', () => {
		const note = expectOk(
			checkValue(made(aField({ type: FieldType.note })), {
				type: FieldType.note,
				text: ' Felt good '
			})
		);

		expect(note).toEqual({ type: FieldType.note, text: 'Felt good' });
	});

	const rejected: [FieldDraft, FieldValue, EntryProblem][] = [
		[aField(), { type: FieldType.duration, seconds: 1.5 }, EntryProblem.outOfRange],
		[aNumberField(), { type: FieldType.rating, stars: 3 }, EntryProblem.wrongType],
		[aNumberField(), { type: FieldType.number, amount: -1 }, EntryProblem.outOfRange],
		[aNumberField(), { type: FieldType.number, amount: Number.NaN }, EntryProblem.outOfRange],
		[aNumberField(), { type: FieldType.number, amount: 1e10 }, EntryProblem.outOfRange],
		[
			aField({ type: FieldType.duration }),
			{ type: FieldType.duration, seconds: 0 },
			EntryProblem.outOfRange
		],
		[
			aField({ type: FieldType.rating }),
			{ type: FieldType.rating, stars: 0 },
			EntryProblem.outOfRange
		],
		[
			aField({ type: FieldType.rating }),
			{ type: FieldType.rating, stars: 2.5 },
			EntryProblem.outOfRange
		],
		[
			aField({ type: FieldType.rating }),
			{ type: FieldType.rating, stars: 6 },
			EntryProblem.outOfRange
		],
		[aChoiceField(), { type: FieldType.choice, option: 'Sleepy' }, EntryProblem.outOfRange],
		[
			aField({ type: FieldType.note }),
			{ type: FieldType.note, text: '  ' },
			EntryProblem.outOfRange
		],
		[
			aField({ type: FieldType.note }),
			{ type: FieldType.note, text: 'x'.repeat(2001) },
			EntryProblem.outOfRange
		]
	];

	it.each(rejected)('rejects %o with %o', (field, value, problem) => {
		expect(expectErr(checkValue(made(field), value))).toBe(problem);
	});
});
