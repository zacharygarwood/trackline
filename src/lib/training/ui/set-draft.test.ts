import { describe, expect, it } from 'vitest';
import { aSet, anExerciseId } from '../../../../tests/builders/training.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Distance } from '../../shared/distance.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { draftFrom, measuresFrom, stepDraft } from './set-draft.ts';

const lb = { mass: MassUnit.lb, distance: DistanceUnit.mi };

describe('draftFrom', () => {
	it('starts from the suggested set in the user units', () => {
		expect(draftFrom(aSet(8, 61.235), lb)).toEqual({
			weight: '135',
			reps: '8',
			distance: '0.0',
			count: '0',
			grade: 0
		});
	});
});

describe('stepDraft', () => {
	const draft = { weight: '135', reps: '1', distance: '0.0', count: '0', grade: 0 };

	it('steps weight by 5 lb or 2.5 kg, reps by one, and distance by a tenth', () => {
		expect(stepDraft(draft, { field: 'weight', direction: 1, unit: MassUnit.lb }).weight).toBe(
			'140'
		);
		expect(stepDraft(draft, { field: 'weight', direction: -1, unit: MassUnit.kg }).weight).toBe(
			'132.5'
		);
		expect(stepDraft(draft, { field: 'distance', direction: 1, unit: MassUnit.lb }).distance).toBe(
			'0.1'
		);
	});

	it('never goes below one rep or zero', () => {
		expect(stepDraft(draft, { field: 'reps', direction: -1, unit: MassUnit.lb }).reps).toBe('1');
		expect(stepDraft(draft, { field: 'count', direction: -1, unit: MassUnit.lb }).count).toBe('0');
	});
});

describe('measuresFrom', () => {
	const draft = { weight: '135', reps: '8', distance: '3.4', count: '12', grade: 4 };

	it('records only what the exercise tracks', () => {
		const lift = measuresFrom(draft, {
			exercise: { id: anExerciseId(), name: 'Bench', tracking: WEIGHT_AND_REPS },
			units: lb
		});
		expect(lift.reps).toBe(8);
		expect(lift.weight?.toUnit(MassUnit.lb)).toBeCloseTo(135);
		expect([lift.distance, lift.grade, lift.seconds, lift.count]).toEqual([
			undefined,
			undefined,
			undefined,
			undefined
		]);
	});

	it('adds the timed seconds to a run', () => {
		const run = measuresFrom(draft, {
			exercise: {
				id: anExerciseId(),
				name: 'Run',
				tracking: {
					fields: [TrackedField.distance, TrackedField.time],
					grades: undefined,
					countLabel: undefined
				}
			},
			units: lb,
			seconds: 1700
		});
		expect(run.seconds).toBe(1700);
		expect(run.distance?.meters).toBeCloseTo(expectOk(Distance.of(3.4, DistanceUnit.mi)).meters);
		expect(run.reps).toBeUndefined();
	});
});
