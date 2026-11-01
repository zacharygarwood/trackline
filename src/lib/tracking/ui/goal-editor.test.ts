import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../../tests/support/result.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { BasicKey, TemplateKey } from '../domain/template.constants.ts';
import { fieldsOfTemplate, templateOf } from '../domain/from-template.ts';
import { Direction, FieldType, GoalType, Measure, Period } from '../domain/tracking.constants.ts';
import { GoalEditor } from './goal-editor.svelte.ts';
import { templateText } from './template-text.ts';

const units = { mass: MassUnit.kg, distance: DistanceUnit.km };

function never(): never {
	throw new Error('Missing test data');
}

function editorFor(key: TemplateKey): GoalEditor {
	const template = templateOf(key);
	const fields = fieldsOfTemplate(template, templateText(template, 'Piano'));
	return new GoalEditor({ fields, kind: template.kind, goal: template.goal }, units);
}

describe('GoalEditor', () => {
	it('starts on the tracker’s own goal, with its target', () => {
		const water = editorFor(TemplateKey.water);

		expect([water.measure, water.period, water.direction]).toEqual([
			Measure.total,
			Period.day,
			Direction.atLeast
		]);
		expect(expectOk(water.goal()).target).toBe(8);
	});

	it('sets a piano tracker to 2 hours a day', () => {
		const piano = editorFor(BasicKey.time);

		piano.chooseMeasure(Measure.total);
		piano.period = Period.day;
		piano.draft = { type: FieldType.duration, hours: '2', minutes: '', seconds: '' };

		expect(expectOk(piano.goal())).toMatchObject({
			measure: Measure.total,
			period: Period.day,
			target: 7200
		});
	});

	it('sets a piano tracker to 3 times a day', () => {
		const piano = editorFor(BasicKey.time);

		piano.chooseMeasure(Measure.entries);
		piano.period = Period.day;
		piano.draft = { type: FieldType.number, text: '3' };

		expect(expectOk(piano.goal())).toEqual({
			type: GoalType.period,
			measure: Measure.entries,
			period: Period.day,
			direction: Direction.atLeast,
			target: 3
		});
	});

	it('starts a new kind of goal at a sensible amount, never empty', () => {
		const piano = editorFor(BasicKey.time);

		piano.chooseMeasure(Measure.total);
		expect(expectOk(piano.goal()).target).toBe(1800);
		piano.chooseMeasure(Measure.entries);
		expect(expectOk(piano.goal()).target).toBe(1);
	});

	it('lets a weight tracker switch from days a week to a goal weight, starting at 0 to fill in', () => {
		const weight = editorFor(TemplateKey.weight);

		weight.chooseMeasure(GoalType.target);

		expect(weight.draft).toEqual({ type: FieldType.number, text: '0' });
		expect(weight.goal().ok).toBe(false);
		weight.draft = { type: FieldType.number, text: '70' };
		expect(expectOk(weight.goal())).toMatchObject({ type: GoalType.target, target: 70 });
	});

	it('brings back the tracker’s own target when switching back', () => {
		const water = editorFor(TemplateKey.water);

		water.chooseMeasure(Measure.days);
		water.chooseMeasure(Measure.total);

		expect(expectOk(water.goal()).target).toBe(8);
	});

	it('offers a choice of field only where there is more than one, and ignores what cannot apply', () => {
		const food = editorFor(TemplateKey.food);
		const water = editorFor(TemplateKey.water);

		water.chooseMeasure(Measure.sessions);
		const protein = food.fields.at(2)?.key ?? never();
		food.chooseField(protein);

		expect(water.measure).toBe(Measure.total);
		expect(water.fields).toHaveLength(1);
		expect(food.field).toBe(protein);
	});
});
