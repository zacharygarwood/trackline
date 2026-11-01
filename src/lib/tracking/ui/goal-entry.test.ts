import { describe, expect, it } from 'vitest';
import { aField, aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { createField } from '../domain/field.ts';
import { FieldType, Measure } from '../domain/tracking.constants.ts';
import { targetField, targetValue, typedTarget } from './goal-entry.ts';

const units = { mass: MassUnit.kg, distance: DistanceUnit.km };
const time = expectOk(createField(aField({ key: 'time', required: false })));

describe('targetField', () => {
	it('types a count of workouts into a plain, required number', () => {
		expect(targetField([], { measure: Measure.sessions, field: undefined })).toMatchObject({
			type: FieldType.number,
			unit: 'workouts',
			required: true
		});
	});

	it('types a total into the field it adds up, and a count of times into a number', () => {
		expect(targetField([time], { measure: Measure.total, field: aKey('time') })).toMatchObject({
			type: FieldType.duration,
			required: true
		});
		expect(targetField([time], { measure: Measure.entries, field: aKey('time') })).toMatchObject({
			type: FieldType.number,
			unit: 'times'
		});
		expect(targetValue(28_800, time)).toEqual({ type: FieldType.duration, seconds: 28_800 });
	});
});

describe('typedTarget', () => {
	const count = targetField([], { measure: Measure.entries, field: undefined });

	it('reads the typed number, and asks for one when empty, zero, or not a number', () => {
		expect(expectOk(typedTarget(count, { type: FieldType.number, text: '4' }, units))).toBe(4);
		expect(typedTarget(count, { type: FieldType.number, text: '0' }, units).ok).toBe(false);
		expect(typedTarget(count, { type: FieldType.number, text: ' ' }, units).ok).toBe(false);
		expect(typedTarget(count, { type: FieldType.number, text: 'lots' }, units).ok).toBe(false);
	});
});
