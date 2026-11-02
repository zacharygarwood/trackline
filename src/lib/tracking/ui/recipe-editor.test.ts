import { describe, expect, it } from 'vitest';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { firstTracker, number, values } from '../../../../tests/support/tracking-app.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { RecipeEditor } from './recipe-editor.svelte.ts';

const units = { mass: MassUnit.kg, distance: DistanceUnit.km };

async function withFoods() {
	const { app, tracker } = await firstTracker(TemplateKey.food);
	const food = async (name: string, calories: number) =>
		expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name,
				fieldKeys: [],
				defaults: values(['calories', number(calories)])
			})
		);
	const [oats, milk] = [await food('Oats', 150), await food('Milk', 100)];
	return { app, tracker, oats, milk };
}

function caloriesOf(editor: RecipeEditor): string | undefined {
	return editor.perServing.find((line) => line.key === aKey('calories'))?.value;
}

describe('RecipeEditor', () => {
	it('finds foods to add by name, leaving out ones already in', async () => {
		const { app, tracker, oats } = await withFoods();
		const editor = new RecipeEditor(app, units);
		await editor.load({ tracker: tracker.id });

		editor.search = 'OA';
		expect(editor.matches).toEqual([oats]);
		editor.add(oats);

		expect(editor.search).toBe('');
		editor.search = 'oa';
		expect(editor.matches).toEqual([]);
	});

	it('shows the numbers per serving as ingredients change, and saves them', async () => {
		const { app, tracker, oats, milk } = await withFoods();
		const editor = new RecipeEditor(app, units);
		await editor.load({ tracker: tracker.id });
		editor.add(oats);
		editor.add(milk);
		editor.step(oats.id, 1);
		editor.makes = '2';
		editor.name = 'Porridge';

		expect(editor.lines.map((line) => line.servings)).toEqual([1.5, 1]);
		expect(caloriesOf(editor)).toBe('162.5 kcal');
		const saved = await editor.save();
		expect(saved?.defaults.get(aKey('calories'))).toEqual(number(162.5));
	});

	it('takes an ingredient out when stepped down to nothing', async () => {
		const { app, tracker, oats } = await withFoods();
		const editor = new RecipeEditor(app, units);
		await editor.load({ tracker: tracker.id });
		editor.add(oats);

		editor.step(oats.id, -1);
		editor.step(oats.id, -1);

		expect(editor.lines).toEqual([]);
		expect(await editor.save()).toBeUndefined();
		expect(editor.problem).toBeDefined();
	});

	it('opens a saved recipe with its ingredients and servings', async () => {
		const { app, tracker, oats } = await withFoods();
		const porridge = expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name: 'Porridge',
				fieldKeys: [],
				recipe: { ingredients: [{ foodId: oats.id, servings: 2 }], servings: 4 }
			})
		);
		const editor = new RecipeEditor(app, units);

		expect(await editor.load({ tracker: tracker.id, subject: porridge.id })).toBe(true);
		expect([editor.name, editor.makes]).toEqual(['Porridge', '4']);
		expect(editor.lines).toEqual([{ food: oats, servings: 2 }]);
		editor.search = 'por';
		expect(editor.matches).toEqual([]);
	});
});
