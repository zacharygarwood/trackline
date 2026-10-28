import { describe, expect, it } from 'vitest';
import { macros } from '../../../../tests/builders/nutrition.builder.ts';
import { nutritionApp } from '../../../../tests/support/nutrition-app.ts';
import { first } from '../../shared/collections.ts';
import { MealSlot } from '../domain/meal-slot.constants.ts';

import { DailyGoalsEditor } from './daily-goals-editor.svelte.ts';
import { NutritionDay } from './nutrition-day.svelte.ts';
import { formatMacroLine } from './nutrition-format.ts';

const chickenForm = {
	name: 'Chicken breast',
	amount: '100',
	unit: 'g',
	calories: '165',
	protein: '31',
	carbs: '0',
	fat: '3,6'
};

async function setUp() {
	const app = nutritionApp();
	const day = new NutritionDay(app, app.clock);
	await day.load();
	const chicken = await day.createFood(chickenForm);
	if (typeof chicken === 'string') throw new Error(chicken);
	return { app, day, chicken };
}

describe('NutritionDay', () => {
	it('creates a food from typed text and previews scaled macros live', async () => {
		const { day, chicken } = await setUp();

		expect(chicken.macrosPerReference).toEqual(macros(165, 31, 0, 3.6));
		expect(day.preview(chicken, '150')).toEqual(macros(247.5, 46.5, 0, 5.4));
		expect(day.preview(chicken, '')).toBeUndefined();
	});

	it('logs a food and shows it under its slot with the day totals', async () => {
		const { day, chicken } = await setUp();

		expect(await day.log(chicken, '150', MealSlot.dinner)).toBeUndefined();

		expect(day.entriesIn(MealSlot.dinner).map((entry) => entry.amount)).toEqual([150]);
		expect(formatMacroLine(day.day.summary.eaten)).toBe('248 kcal · P 46.5 g · C 0 g · F 5.4 g');
	});

	it('pre-fills last time’s amount, or the reference amount for a new food', async () => {
		const { day, chicken } = await setUp();
		expect(await day.suggestedAmount(chicken)).toBe('100');

		await day.log(chicken, '180', MealSlot.lunch);

		expect(await day.suggestedAmount(chicken)).toBe('180');
	});

	it('explains rejected input', async () => {
		const { day, chicken } = await setUp();

		expect(await day.log(chicken, '0', MealSlot.lunch)).toBe('Enter an amount greater than zero.');
		expect(await day.createFood({ ...chickenForm, calories: 'lots' })).toBe(
			'Check the food: it needs a name, a positive amount, a unit, and macros of zero or more.'
		);
	});

	it('adjusts and removes entries', async () => {
		const { day, chicken } = await setUp();
		await day.log(chicken, '100', MealSlot.lunch);
		const entry = first(day.day.entries);
		if (entry === undefined) throw new Error('expected an entry');

		await day.changeAmount(entry.id, '200');
		expect(day.day.summary.eaten.calories).toBe(330);

		await day.remove(entry.id);
		expect(day.day.entries).toEqual([]);
	});

	it('saves a slot as a meal and logs it on another day', async () => {
		const { day, chicken } = await setUp();
		await day.log(chicken, '100', MealSlot.lunch);
		expect(await day.saveSlotAsMeal(MealSlot.lunch, 'Lunch box')).toBeUndefined();
		const meal = first(day.meals);
		if (meal === undefined) throw new Error('expected a meal');

		await day.moveBy(1);
		await day.logMeal(meal.id, MealSlot.lunch);

		expect(day.date.toString()).toBe('2026-10-28');
		expect(day.entriesIn(MealSlot.lunch)).toHaveLength(1);
	});

	it('suggests the meal slot for the time of day', async () => {
		const { day } = await setUp();

		expect(Object.values(MealSlot)).toContain(day.suggestedSlot);
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
