import { describe, expect, it } from 'vitest';
import { aTracker } from '../../../../tests/builders/tracker.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import {
	Combine,
	Direction,
	Measure,
	Period,
	TrackerField,
	TrackerSource
} from './tracker.constants.ts';
import {
	checkEntryValue,
	combineEntries,
	createTracker,
	fillOf,
	InvalidTracker,
	meetsGoal,
	periodStart,
	sourceOf
} from './tracker.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));

describe('createTracker', () => {
	it('trims the name and keeps a unit only for logged numbers', () => {
		const water = expectOk(createTracker(aTracker({ name: '  Drink   water ', unit: ' cups ' })));
		const protein = expectOk(
			createTracker(aTracker({ measure: Measure.protein, unit: 'cups', combine: Combine.average }))
		);

		expect([water.name, water.unit]).toEqual(['Drink water', 'cups']);
		expect([protein.unit, protein.combine]).toEqual(['', Combine.total]);
	});

	it('settles how ratings, done, and weight work whatever was picked', () => {
		const mood = expectOk(
			createTracker(aTracker({ measure: Measure.rating, goal: 9, combine: Combine.total }))
		);
		const vitamins = expectOk(createTracker(aTracker({ measure: Measure.done, goal: 7 })));
		const weight = expectOk(
			createTracker(aTracker({ measure: Measure.weight, goal: 78, period: Period.week }))
		);

		expect([mood.goal, mood.combine]).toEqual([5, Combine.average]);
		expect(vitamins.combine).toBe(Combine.days);
		expect(weight.period).toBe(Period.day);
	});

	it.each([
		[{ name: ' ' }, TrackerField.name],
		[{ name: 'x'.repeat(41) }, TrackerField.name],
		[{ unit: 'x'.repeat(21) }, TrackerField.unit],
		[{ goal: 0 }, TrackerField.goal],
		[{ measure: Measure.sessions }, TrackerField.subject],
		[{ measure: Measure.calories, subjectId: 'squat' }, TrackerField.subject]
	])('rejects %o', (change, field) => {
		expect(expectErr(createTracker(aTracker(change)))).toEqual(new InvalidTracker(field));
	});
});

describe('tracker values', () => {
	it('knows each measure source', () => {
		expect([
			sourceOf(Measure.fat),
			sourceOf(Measure.reps),
			sourceOf(Measure.weight),
			sourceOf(Measure.done)
		]).toEqual([
			TrackerSource.food,
			TrackerSource.workouts,
			TrackerSource.weight,
			TrackerSource.log
		]);
	});

	it('checks logged values by measure', () => {
		expect(expectOk(checkEntryValue(aTracker({ measure: Measure.done }), 0))).toBe(1);
		expect(checkEntryValue(aTracker({ measure: Measure.rating }), 3.5).ok).toBe(false);
		expect(checkEntryValue(aTracker(), -1).ok).toBe(false);
	});

	it('totals, averages, or counts days in the current period', () => {
		const thursday = date('2026-10-29');
		const sleep = aTracker({ combine: Combine.average, period: Period.week });
		const water = aTracker();
		const entry = (trackerId = sleep.id, day = '2026-10-28', value = 7) => ({
			id: anId<'TrackerEntry'>(),
			trackerId,
			date: date(day),
			value
		});
		const entries = [
			entry(sleep.id, '2026-10-25', 3),
			entry(sleep.id, '2026-10-27', 6),
			entry(sleep.id, '2026-10-28', 8),
			entry(water.id, '2026-10-29', 2),
			entry(water.id, '2026-10-29', 3)
		];
		const weekStart = periodStart(Period.week, thursday, WeekStart.monday);

		expect(combineEntries(sleep, entries, weekStart)).toBe(7);
		expect(combineEntries(water, entries, thursday)).toBe(5);
		expect(combineEntries({ ...water, combine: Combine.days }, entries, weekStart)).toBe(1);
		expect(combineEntries(sleep, [], weekStart)).toBe(0);
	});

	it('fills toward the goal, and weight from the first weigh-in toward its target', () => {
		const weight = aTracker({ measure: Measure.weight, goal: 78 });

		expect(fillOf(aTracker(), 4)).toBe(0.5);
		expect(fillOf(aTracker(), 12)).toBe(1);
		expect(fillOf(weight, 80, 82)).toBe(0.5);
		expect(fillOf(weight, 78)).toBe(1);
		expect(meetsGoal(aTracker({ direction: Direction.atMost, goal: 2 }), 3)).toBe(false);
		expect(meetsGoal(aTracker(), 8)).toBe(true);
	});
});
