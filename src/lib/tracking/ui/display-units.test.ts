import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { first } from '../../shared/collections.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { draftFromTemplate, templateOf } from '../domain/from-template.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { createTracker } from '../domain/tracker.ts';
import { FieldType } from '../domain/tracking.constants.ts';
import { unitText } from './display-units.ts';
import { templateText } from './template-text.ts';

const kg = { mass: MassUnit.kg, distance: DistanceUnit.km };

function numberField(key: TemplateKey) {
	const template = templateOf(key);
	const placement = { id: anId<'Tracker'>(), position: 0 };
	const tracker = expectOk(
		createTracker(draftFromTemplate(template, placement, templateText(template)))
	);
	const field = first(tracker.fields);
	if (field?.type !== FieldType.number) throw new Error('Expected a number field');
	return field;
}

describe('unitText', () => {
	it('names the unit in the plural, or without an amount', () => {
		expect(unitText(numberField(TemplateKey.water), kg, 2)).toBe('glasses');
		expect(unitText(numberField(TemplateKey.water), kg)).toBe('glasses');
	});

	it('names a template’s unit in the singular for exactly one', () => {
		expect(unitText(numberField(TemplateKey.water), kg, 1)).toBe('glass');
		expect(unitText(numberField(TemplateKey.food), kg, 1)).toBe('serving');
	});

	it('names masses in the user’s unit whatever the amount', () => {
		expect(unitText(numberField(TemplateKey.weight), kg, 1)).toBe('kg');
	});
});
