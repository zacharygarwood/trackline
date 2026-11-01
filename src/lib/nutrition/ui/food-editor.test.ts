import { describe, expect, it } from 'vitest';
import { macros } from '../../../../tests/builders/nutrition.builder.ts';
import { nutritionApp } from '../../../../tests/support/nutrition-app.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { FoodUnit } from '../../shared/food-unit.constants.ts';
import { FoodEditor } from './food-editor.svelte.ts';

async function setUp() {
	const app = nutritionApp();
	const oats = expectOk(
		await app.createFood.execute({
			name: 'Oats',
			reference: { amount: 40, unit: FoodUnit.g },
			macrosPerReference: macros(150, 5, 27, 3)
		})
	);
	return { app, oats, editor: new FoodEditor(app, oats) };
}

describe('FoodEditor', () => {
	it('starts filled in with the food', async () => {
		const { editor } = await setUp();

		expect([editor.name, editor.form.base, editor.form.unit]).toEqual(['Oats', '40', FoodUnit.g]);
		expect([editor.form.calories, editor.form.protein, editor.form.carbs, editor.form.fat]).toEqual(
			['150', '5', '27', '3']
		);
	});

	it('saves changes, keeping carbs and fat when they are not tracked', async () => {
		const { app, editor } = await setUp();
		editor.name = 'rolled oats';
		editor.form.calories = '160';

		const saved = await editor.save(false);

		expect(saved?.name).toBe('Rolled oats');
		expect(saved?.macrosPerReference).toEqual(macros(160, 5, 27, 3));
		expect(await app.listFoods.execute()).toEqual([saved]);
	});

	it('refuses an empty name and deletes the food', async () => {
		const { app, editor } = await setUp();
		editor.name = ' ';

		expect(await editor.save(false)).toBeUndefined();
		await editor.delete();
		expect(await app.listFoods.execute()).toEqual([]);
	});
});
