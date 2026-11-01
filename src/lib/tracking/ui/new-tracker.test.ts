import { describe, expect, it } from 'vitest';
import { trackingApp } from '../../../../tests/support/tracking-app.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { BASICS } from '../domain/basics.ts';
import { BasicKey } from '../domain/template.constants.ts';
import { FieldType, Measure, Period } from '../domain/tracking.constants.ts';
import { NewTracker } from './new-tracker.svelte.ts';

const units = { mass: MassUnit.kg, distance: DistanceUnit.km };
const time = BASICS.find((basic) => basic.key === BasicKey.time);

function newPiano(): NewTracker {
	if (time === undefined) throw new Error('No Time basic');
	return new NewTracker(time, units);
}

describe('NewTracker', () => {
	it('adds a named tracker with the goal chosen while creating it', async () => {
		const app = trackingApp();
		const piano = newPiano();
		piano.name = 'Piano';
		piano.goal.chooseMeasure(Measure.total);
		piano.goal.period = Period.day;
		piano.goal.draft = { type: FieldType.duration, hours: '2', minutes: '', seconds: '' };

		const tracker = await piano.add(app.addTrackers);

		expect(tracker).toMatchObject({
			name: 'Piano',
			goal: { measure: Measure.total, period: Period.day, target: 7200 }
		});
	});

	it('asks for a name, and for a goal when its target is empty', async () => {
		const app = trackingApp();
		const piano = newPiano();

		expect(await piano.add(app.addTrackers)).toBeUndefined();
		expect(piano.problem).toBe('Give it a name.');
		piano.name = 'Piano';
		piano.goal.draft = { type: FieldType.number, text: '' };
		expect(await piano.add(app.addTrackers)).toBeUndefined();
		expect(piano.problem).toBe('Enter a goal, so the bar has something to fill.');
	});

	it('gives a number tracker the unit typed, and shows it in the goal', async () => {
		const number = BASICS.find((basic) => basic.key === BasicKey.number);
		if (number === undefined) throw new Error('No Number basic');
		const app = trackingApp();
		const water = new NewTracker(number, units);
		water.name = 'Water';
		water.unit = 'oz';

		expect(water.goal.tracker.fields.at(0)).toMatchObject({ unit: 'oz' });
		const tracker = await water.add(app.addTrackers);
		expect(tracker?.fields.at(0)).toMatchObject({ unit: 'oz' });
	});

	it('asks for no unit when the tracker has no plain number', () => {
		expect(newPiano().unitField).toBeUndefined();
	});
});
