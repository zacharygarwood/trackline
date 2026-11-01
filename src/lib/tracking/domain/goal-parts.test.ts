import { describe, expect, it } from 'vitest';
import { aField, aKey, aNumberField } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { createField, type FieldDraft } from './field.ts';
import { InvalidGoal, type Goal } from './goal.ts';
import { fieldsFor, goalFrom, measureOf, measuresFor, partsOf } from './goal-parts.ts';
import {
	Dimension,
	Direction,
	FieldType,
	GoalType,
	Measure,
	Period,
	TrackerKind
} from './tracking.constants.ts';

const fields = (...drafts: FieldDraft[]) => drafts.map((draft) => expectOk(createField(draft)));
const piano = fields(aField({ key: 'time' }), aField({ type: FieldType.note, key: 'note' }));
const twoHoursADay = {
	measure: Measure.total,
	field: aKey('time'),
	period: Period.day,
	direction: Direction.atLeast,
	target: 7200
} as const;

describe('measuresFor', () => {
	it('offers days, times, and a total or average of a time', () => {
		expect(measuresFor(piano, TrackerKind.log)).toEqual([
			Measure.days,
			Measure.entries,
			Measure.total,
			Measure.average
		]);
	});

	it('offers workouts to a tracker with sessions, but no target across its exercises', () => {
		const lifts = fields(aNumberField({ dimension: Dimension.mass, key: 'kg' }));

		expect(measuresFor(lifts, TrackerKind.workout)).toEqual([
			Measure.days,
			Measure.entries,
			Measure.sessions,
			Measure.total,
			Measure.average
		]);
	});

	it('offers a target for a weight or distance, not for a plain count like glasses', () => {
		const kg = fields(aNumberField({ dimension: Dimension.mass, key: 'kg' }));

		expect(measuresFor(kg, TrackerKind.log)).toContain(GoalType.target);
		expect(measuresFor(fields(aNumberField()), TrackerKind.log)).not.toContain(GoalType.target);
	});

	it('offers only counts to a tracker with nothing to add up', () => {
		const done = fields(aField({ type: FieldType.check, key: 'done' }));

		expect(measuresFor(done, TrackerKind.log)).toEqual([Measure.days, Measure.entries]);
	});
});

describe('fieldsFor', () => {
	it('lets an average be of a rating, but not a total', () => {
		const mood = fields(aField({ type: FieldType.rating, key: 'mood' }));

		expect(fieldsFor(Measure.average, mood)).toHaveLength(1);
		expect(fieldsFor(Measure.total, mood)).toHaveLength(0);
		expect(fieldsFor(Measure.days, mood)).toHaveLength(0);
	});
});

describe('goalFrom', () => {
	it('builds 2 hours of piano a day', () => {
		expect(expectOk(goalFrom(twoHoursADay, piano, TrackerKind.log))).toEqual({
			type: GoalType.period,
			measure: Measure.total,
			field: aKey('time'),
			period: Period.day,
			direction: Direction.atLeast,
			target: 7200
		});
	});

	it('builds 3 times a day, leaving out the field a count does not need', () => {
		const goal = expectOk(
			goalFrom({ ...twoHoursADay, measure: Measure.entries, target: 3 }, piano, TrackerKind.log)
		);

		expect(goal).toEqual({
			type: GoalType.period,
			measure: Measure.entries,
			period: Period.day,
			direction: Direction.atLeast,
			target: 3
		});
	});

	it('refuses a total without a field, or of a field the tracker lacks', () => {
		const noField = { ...twoHoursADay, field: undefined };
		const otherField = { ...twoHoursADay, field: aKey('distance') };

		expect(expectErr(goalFrom(noField, piano, TrackerKind.log))).toBeInstanceOf(InvalidGoal);
		expect(expectErr(goalFrom(otherField, piano, TrackerKind.log))).toBeInstanceOf(InvalidGoal);
	});

	it('round-trips every goal through its parts', () => {
		const weight: Goal = { type: GoalType.target, field: aKey('kg'), target: 70 };
		const kg = fields(aNumberField({ dimension: Dimension.mass, key: 'kg' }));
		const twoHours = expectOk(goalFrom(twoHoursADay, piano, TrackerKind.log));

		expect(expectOk(goalFrom(partsOf(weight), kg, TrackerKind.log))).toEqual(weight);
		expect(expectOk(goalFrom(partsOf(twoHours), piano, TrackerKind.log))).toEqual(twoHours);
		expect(measureOf(weight)).toBe(GoalType.target);
	});
});
