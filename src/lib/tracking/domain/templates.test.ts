import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { BASICS } from './basics.ts';
import { BasicKey, TemplateGroup, TemplateKey, type TemplateField } from './template.constants.ts';
import {
	draftFromTemplate,
	fieldsOfTemplate,
	templateOf,
	type TemplateText
} from './from-template.ts';
import { TEMPLATES } from './templates.ts';
import { createTracker, fieldOf } from './tracker.ts';
import { fieldKey } from './field.ts';
import { isOnceADay } from './goal-parts.ts';
import { Dimension, FieldType, TrackerKind } from './tracking.constants.ts';

const text: TemplateText = {
	name: 'Tracker',
	label: (field: TemplateField) => `Label ${field}`,
	unit: (unit) => `unit ${unit}`
};
const placement = { id: anId<'Tracker'>(), position: 2 };

describe('templates', () => {
	it.each(TEMPLATES.map((template) => [template.key, template]))(
		'%s makes a valid tracker',
		(_, template) => {
			const tracker = expectOk(createTracker(draftFromTemplate(template, placement, text)));

			expect(tracker).toMatchObject({ ...placement, kind: template.kind, goal: template.goal });
		}
	);

	it('starts libraries only with things that fill the tracker fields', () => {
		for (const template of TEMPLATES) {
			const keys = template.fields.map((field) => field.key);
			const starterFields = template.starters.flatMap((starter) => starter.fields);

			expect(starterFields.every((field) => keys.includes(field))).toBe(true);
		}
	});

	it('has one template per key, and something in every group', () => {
		expect(new Set(TEMPLATES.map((template) => template.key)).size).toBe(TEMPLATES.length);
		for (const group of Object.values(TemplateGroup)) {
			expect(TEMPLATES.some((template) => template.group === group)).toBe(true);
		}
	});

	it('labels fields in the user words and leaves mass and distance units to Settings', () => {
		const workouts = expectOk(
			createTracker(draftFromTemplate(templateOf(TemplateKey.workouts), placement, text))
		);
		const reps = fieldOf(workouts, fieldKey('reps'));
		const weight = fieldOf(workouts, fieldKey('weight'));

		expect(reps).toMatchObject({ label: 'Label reps', unit: 'unit reps' });
		expect(weight).toMatchObject({ type: FieldType.number, dimension: Dimension.mass, unit: '' });
	});

	it('gives a template’s checked fields before the tracker exists', () => {
		const water = templateOf(TemplateKey.water);

		expect(fieldsOfTemplate(water, text).map((field) => field.label)).toEqual(['Label glasses']);
	});

	it('offers a basic building block for every kind but workouts and food', () => {
		expect(BASICS.map((basic) => basic.kind)).toEqual(
			expect.arrayContaining([TrackerKind.log, TrackerKind.photos, TrackerKind.collection])
		);
		expect(TEMPLATES.slice(0, BASICS.length)).toEqual(BASICS);
	});

	it('builds ready-made templates on the basics', () => {
		expect(templateOf(TemplateKey.bodyPhotos).fields).toEqual(templateOf(BasicKey.photos).fields);
	});

	it('leaves a bare amount without a unit, for the tracker name to explain', () => {
		const number = expectOk(
			createTracker(draftFromTemplate(templateOf(BasicKey.number), placement, text))
		);

		expect(fieldOf(number, fieldKey('amount'))).toMatchObject({
			dimension: Dimension.plain,
			unit: ''
		});
	});

	it.each([TemplateKey.weight, TemplateKey.mood, BasicKey.number, BasicKey.time, BasicKey.rating])(
		'%s fills its bar with one entry a day',
		(key) => {
			expect(isOnceADay(templateOf(key).goal)).toBe(true);
		}
	);
});
