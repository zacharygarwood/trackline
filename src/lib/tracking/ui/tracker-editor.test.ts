import { describe, expect, it } from 'vitest';
import { firstTracker } from '../../../../tests/support/tracking-app.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { TrackerEditor } from './tracker-editor.svelte.ts';

const units = { mass: MassUnit.kg, distance: DistanceUnit.km };

async function editing(key: TemplateKey) {
	const { app, tracker } = await firstTracker(key);
	const editor = new TrackerEditor(app, units);
	await editor.load(tracker.id);
	return editor;
}

describe('TrackerEditor', () => {
	it('changes Water from glasses to oz, renaming its field, and the goal follows', async () => {
		const editor = await editing(TemplateKey.water);
		const glasses = editor.renames.at(0);
		if (glasses === undefined) throw new Error('No number field to rename');
		glasses.label = 'Water';
		glasses.unit = 'oz';

		expect(editor.goal?.input).toMatchObject({ label: 'Water', unit: 'oz' });
		const saved = await editor.save();
		expect(saved?.fields.at(0)).toMatchObject({ label: 'Water', unit: 'oz' });
	});

	it('explains a unit that is too long', async () => {
		const editor = await editing(TemplateKey.water);
		const glasses = editor.renames.at(0);
		if (glasses !== undefined) glasses.unit = 'x'.repeat(21);

		expect(await editor.save()).toBeUndefined();
		expect(editor.problem).toBe('Check the values and try again.');
	});

	it('offers no units to change for trackers without a plain number', async () => {
		expect((await editing(TemplateKey.sleep)).renames).toEqual([]);
	});
});
