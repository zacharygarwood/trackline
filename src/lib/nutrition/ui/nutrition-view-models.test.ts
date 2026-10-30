import { describe, expect, it } from 'vitest';
import { nutritionApp } from '../../../../tests/support/nutrition-app.ts';
import { FoodUnit } from '../../shared/food-unit.constants.ts';
import { hourOf } from '../../ui/format.ts';
import { mealSlotAt } from '../domain/meal-slot.ts';
import { DailyGoalsEditor } from './daily-goals-editor.svelte.ts';
import { FoodScreen } from './food-screen.svelte.ts';
import { caloriesFrom } from './new-food-form.svelte.ts';

async function setUp() {
	const app = nutritionApp();
	const screen = new FoodScreen(app, app.clock);
	await screen.load();
	screen.search('chicken breast');
	screen.form.base = '100';
	screen.form.unit = FoodUnit.g;
	screen.form.calories = '165';
	screen.form.protein = '31';
	const entry = await screen.create(false, FoodUnit.serving);
	if (entry === undefined) throw new Error('expected an entry');
	return { app, screen, entry };
}

describe('FoodScreen', () => {
	it('creates a typed food and logs one portion of it in the slot of the hour', async () => {
		const { app, screen, entry } = await setUp();

		expect(entry).toMatchObject({
			foodNameSnapshot: 'Chicken breast',
			amount: 100,
			slot: mealSlotAt(hourOf(app.clock.now()))
		});
		expect(entry.macrosSnapshot).toEqual({ calories: 165, protein: 31, carbs: 0, fat: 0 });
		expect(screen.query).toBe('');
		expect(screen.day.summary.eaten.calories).toBe(165);
	});

	it('offers recent foods and matches, and only creates new names', async () => {
		const { screen } = await setUp();

		expect(screen.visibleFoods.map((food) => food.name)).toEqual(['Chicken breast']);
		screen.search('CHICKEN BREAST');
		expect(screen.canCreate).toBe(false);
		screen.search('rice');
		expect([screen.visibleFoods.length, screen.canCreate]).toEqual([0, true]);
	});

	it('steps and logs a typed amount', async () => {
		const { screen } = await setUp();
		const [chicken] = screen.foods;
		if (chicken === undefined) throw new Error('expected chicken');

		screen.toggleFood(chicken);
		screen.stepFoodAmount(chicken, 1);
		expect(screen.amount).toBe('110');
		const entry = await screen.addTyped(chicken);

		expect(entry?.amount).toBe(110);
		expect(screen.openFood).toBeUndefined();
	});

	it('changes, removes, and restores what was eaten', async () => {
		const { screen, entry } = await setUp();

		await screen.stepEntry(entry, -1);
		expect(screen.day.entries.at(0)?.amount).toBe(90);
		const changed = screen.day.entries.at(0);
		if (changed === undefined) throw new Error('expected the entry');
		await screen.remove(changed);
		expect(screen.day.entries).toEqual([]);
		await screen.restore(changed);
		expect(screen.day.entries).toEqual([changed]);
	});

	it('works out calories from protein, carbs, and fat when those are tracked', async () => {
		expect(caloriesFrom({ protein: '30', carbs: '10', fat: '5' })).toBe(205);
		const { screen } = await setUp();
		screen.search('shake');
		screen.form.protein = '30';
		screen.form.carbs = '6';
		screen.form.fat = '3';

		const shake = await screen.create(true, FoodUnit.serving);

		expect(shake?.macrosSnapshot).toEqual({ calories: 171, protein: 30, carbs: 6, fat: 3 });
		expect(shake?.unitSnapshot).toBe('serving');
	});
});

describe('DailyGoalsEditor', () => {
	it('saves typed targets and shows them next time', async () => {
		const app = nutritionApp();
		const editor = new DailyGoalsEditor(app, app.clock);
		await editor.load();
		expect(editor.form).toEqual({ calories: '', protein: '', carbs: '', fat: '' });

		expect(
			await editor.save({ calories: '2200', protein: '160', carbs: '250', fat: '70' })
		).toBeUndefined();

		await editor.load();
		expect(editor.form).toEqual({ calories: '2200', protein: '160', carbs: '250', fat: '70' });
	});

	it('rejects a target that is not a number', async () => {
		const app = nutritionApp();
		const editor = new DailyGoalsEditor(app, app.clock);

		expect(await editor.save({ calories: '', protein: '1', carbs: '1', fat: '1' })).toBe(
			'Enter numbers of zero or more for every goal.'
		);
	});

	it('skips saving when every field is blank, and saves once one is filled', async () => {
		const app = nutritionApp();
		const editor = new DailyGoalsEditor(app, app.clock);
		const blank = { calories: ' ', protein: '', carbs: '', fat: '' };

		expect(await editor.saveIfFilled(blank)).toBeUndefined();
		await editor.load();
		expect(editor.targets).toBeUndefined();

		expect(await editor.saveIfFilled({ ...blank, calories: '2000' })).toBe(
			'Enter numbers of zero or more for every goal.'
		);
	});
});
