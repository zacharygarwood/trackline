import { describe, expect, it } from 'vitest';
import {
	aSet,
	aTemplateId,
	aWorkout,
	anExerciseId
} from '../../../../tests/builders/training.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { Distance } from '../../shared/distance.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { Mass } from '../../shared/mass.ts';
import type { Exercise } from '../domain/exercise.ts';
import { GradeScale, TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import {
	exerciseSummary,
	gradeNames,
	liftNumber,
	primaryField,
	setText,
	workoutName
} from './workout-format.ts';

const lb = { mass: MassUnit.lb, distance: DistanceUnit.mi };
const kg = { mass: MassUnit.kg, distance: DistanceUnit.km };
const exercise = (name: string, tracking: Exercise['tracking']): Exercise => ({
	id: anExerciseId(),
	name,
	tracking
});
const bench = exercise('Bench press', WEIGHT_AND_REPS);
const boulder = exercise('Bouldering', {
	fields: [TrackedField.grade],
	grades: { scale: GradeScale.v },
	countLabel: undefined
});
const swim = exercise('Swim', {
	fields: [TrackedField.distance, TrackedField.time, TrackedField.count],
	grades: undefined,
	countLabel: 'Laps'
});
const meters = (amount: number) => expectOk(Distance.fromMeters(amount));

describe('liftNumber', () => {
	it('rounds kilograms to the half and pounds to the whole', () => {
		expect(liftNumber(expectOk(Mass.fromKg(61.3)), MassUnit.kg)).toBe(61.5);
		expect(liftNumber(expectOk(Mass.fromKg(61.3)), MassUnit.lb)).toBe(135);
	});
});

describe('setText', () => {
	it('shows weight and reps, short in a set box', () => {
		const set = aSet(8, 61.235, true);
		expect(setText(set, bench, { units: lb })).toBe('135 × 8');
		expect(setText(set, bench, { units: lb, compact: true })).toBe('135×8');
	});

	it('shows a grade, a distance, a time, and a count', () => {
		expect(setText({ grade: 6, completed: true }, boulder, { units: kg })).toBe('V5');
		expect(
			setText({ distance: meters(1000), seconds: 1500, count: 40, completed: true }, swim, {
				units: kg
			})
		).toBe('1.0 km, 25:00, 40 laps');
	});
});

describe('exerciseSummary', () => {
	it('sums up lifts by their top set', () => {
		expect(exerciseSummary([aSet(8, 60, true), aSet(6, 70, true)], bench, kg)).toBe(
			'2 × 6 at 70 kg'
		);
	});

	it('sums up grades by the hardest one', () => {
		expect(
			exerciseSummary(
				[
					{ grade: 3, completed: true },
					{ grade: 6, completed: true }
				],
				boulder,
				kg
			)
		).toBe('Top V5, 2 logged');
	});

	it('adds up distance, time, and count', () => {
		const sets = [
			{ distance: meters(500), seconds: 600, count: 20, completed: true },
			{ distance: meters(500), seconds: 660, count: 20, completed: true }
		];
		expect(exerciseSummary(sets, swim, kg)).toBe('1.0 km, 21:00, 40 laps');
	});
});

describe('workoutName', () => {
	it("uses the template's name, or else the first exercise's", () => {
		const legs = { id: aTemplateId(), name: 'Legs', position: 0, exercises: [] };
		const fromTemplate = aWorkout().fromTemplate(legs.id).with(bench.id).active();
		const loose = aWorkout().with(bench.id).active();

		expect(workoutName(fromTemplate, [legs], () => 'x')).toBe('Legs');
		expect(workoutName(loose, [legs], () => 'Bench press')).toBe('Bench press');
	});
});

describe('primaryField', () => {
	it('charts grades first, then weight, then distance', () => {
		expect([primaryField(boulder), primaryField(bench), primaryField(swim)]).toEqual([
			TrackedField.grade,
			TrackedField.weight,
			TrackedField.distance
		]);
		expect(gradeNames(boulder).at(0)).toBe('VB');
		expect(gradeNames(bench)).toEqual([]);
	});
});
