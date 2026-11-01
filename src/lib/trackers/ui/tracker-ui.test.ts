import { describe, expect, it } from 'vitest';
import { aTracker } from '../../../../tests/builders/tracker.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { Combine, Direction, Measure, Period, TrackerSource } from '../domain/tracker.constants.ts';
import { weeklyValues } from './tracker-chart.ts';
import { goalText, valueText } from './tracker-format.ts';
import { TrackerForm } from './tracker-form.svelte.ts';
import { isPresetName } from './tracker-presets.ts';

const miles = { mass: MassUnit.lb, distance: DistanceUnit.mi };
const date = (text: string) => expectOk(LocalDate.parse(text));

describe('tracker text', () => {
	it('shows values and goals in the user units', () => {
		const run = aTracker({ measure: Measure.distance, subjectId: 'x', unit: '', goal: 24_140.16 });
		const weight = aTracker({ measure: Measure.weight, goal: 80 });
		const coffee = aTracker({ unit: 'cups', goal: 2, direction: Direction.atMost });

		expect([valueText(run, 8046.72, miles), goalText(run, miles)]).toEqual(['5', '/ 15 mi']);
		expect(goalText(weight, miles)).toBe('to 176.4 lb');
		expect(goalText(coffee, miles)).toBe('/ 2 cups max');
		expect(valueText(weight, undefined, miles)).toBe('—');
		const protein = aTracker({ measure: Measure.protein, unit: '', goal: 150 });
		expect([valueText(protein, 65.1, miles), goalText(protein, miles)]).toEqual(['65', '/ 150 g']);
	});
});

describe('TrackerForm', () => {
	it('names a tracker after what it measures until a name is typed', () => {
		const form = new TrackerForm();
		form.chooseSource(TrackerSource.food);
		expect([form.measure, form.name]).toEqual([Measure.calories, 'Calories']);

		form.chooseMeasure(Measure.food);
		form.chooseSubject({ id: 'oats', name: 'Oats', unit: 'g' });
		expect([form.name, form.unit, form.needsSubject]).toEqual(['Oats', 'g', true]);

		form.rename('Porridge');
		form.chooseSource(TrackerSource.workouts);
		expect([form.name, form.subjectId]).toEqual(['Porridge', undefined]);
	});

	it('starts from a preset and saves the goal in stored units', () => {
		const form = new TrackerForm();
		form.usePreset('run');
		form.chooseSubject({ id: 'run', name: 'Running', unit: '' });

		expect(form.toCommand(miles)).toMatchObject({
			name: 'Run',
			measure: Measure.distance,
			subjectId: 'run',
			period: Period.week
		});
		expect(form.toCommand(miles).goal).toBeCloseTo(24_140.16);
		expect([isPresetName('run'), isPresetName('nope')]).toEqual([true, false]);
	});

	it('fills in an existing tracker to edit it', () => {
		const form = new TrackerForm();
		form.fill(aTracker({ measure: Measure.weight, goal: 80, name: 'Weight' }), miles);
		form.goal = '1,000';

		expect(form.goal).toBe('1,000');
		expect(form.toCommand({ ...miles, mass: MassUnit.kg }).goal).toBe(1000);
	});
});

describe('weeklyValues', () => {
	it('averages a daily tracker over the days logged, and combines a weekly one', () => {
		const water = aTracker();
		const sleep = aTracker({ combine: Combine.average, period: Period.week });
		const entry = (trackerId: typeof water.id, day: string, value: number) => ({
			id: anId<'TrackerEntry'>(),
			trackerId,
			date: date(day),
			value
		});
		const entries = [
			entry(water.id, '2026-10-20', 6),
			entry(water.id, '2026-10-20', 2),
			entry(water.id, '2026-10-22', 4),
			entry(water.id, '2026-10-27', 5),
			entry(sleep.id, '2026-10-21', 6),
			entry(sleep.id, '2026-10-23', 8)
		];
		const input = { entries, today: date('2026-10-29'), weeks: 2, weekStart: WeekStart.monday };

		expect(weeklyValues({ ...input, tracker: water })).toEqual([6, 5]);
		expect(weeklyValues({ ...input, tracker: sleep })).toEqual([7, 0]);
	});
});
