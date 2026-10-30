import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { GradeScale, TrackedField, V_GRADES } from './tracking.constants.ts';
import { createTracking, gradesOf, InvalidTracking, tracks, WEIGHT_AND_REPS } from './tracking.ts';

const { weight, reps, time, distance, grade, count } = TrackedField;

describe('createTracking', () => {
	it('accepts weight and reps, and puts fields in their usual order', () => {
		expect(expectOk(createTracking(WEIGHT_AND_REPS)).fields).toEqual([weight, reps]);
		const swim = expectOk(
			createTracking({ fields: [count, time, distance], grades: undefined, countLabel: ' Laps ' })
		);
		expect(swim.fields).toEqual([distance, time, count]);
		expect(swim.countLabel).toBe('Laps');
	});

	it('accepts a graded exercise with a built-in or custom scale', () => {
		const climbing = { fields: [grade], countLabel: undefined };
		expect(
			expectOk(createTracking({ ...climbing, grades: { scale: GradeScale.v } })).grades
		).toEqual({
			scale: GradeScale.v
		});
		expectOk(
			createTracking({
				...climbing,
				grades: { scale: GradeScale.custom, grades: ['White', 'Blue'] }
			})
		);
	});

	it.each([
		['no fields', { fields: [], grades: undefined, countLabel: undefined }],
		['a repeated field', { fields: [reps, reps], grades: undefined, countLabel: undefined }],
		['grade without a scale', { fields: [grade], grades: undefined, countLabel: undefined }],
		[
			'a scale without grade',
			{ fields: [time], grades: { scale: GradeScale.v }, countLabel: undefined }
		],
		[
			'an empty custom scale',
			{ fields: [grade], grades: { scale: GradeScale.custom, grades: [] }, countLabel: undefined }
		],
		['count without a label', { fields: [count], grades: undefined, countLabel: '  ' }],
		['a label without count', { fields: [time], grades: undefined, countLabel: 'Laps' }]
	] as const)('rejects %s', (_, tracking) => {
		expect(expectErr(createTracking(tracking))).toBeInstanceOf(InvalidTracking);
	});
});

describe('gradesOf', () => {
	it('lists a built-in scale or the custom grades, easiest first', () => {
		expect(gradesOf({ scale: GradeScale.v })).toBe(V_GRADES);
		expect(gradesOf({ scale: GradeScale.custom, grades: ['A', 'B'] })).toEqual(['A', 'B']);
	});
});

describe('tracks', () => {
	it('tells whether a field is tracked', () => {
		expect(tracks(WEIGHT_AND_REPS, reps)).toBe(true);
		expect(tracks(WEIGHT_AND_REPS, weight) && !tracks(WEIGHT_AND_REPS, time)).toBe(true);
	});
});
