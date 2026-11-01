import { describe, expect, it } from 'vitest';
import { macros } from '../../../../tests/builders/nutrition.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { nutritionApp } from '../../../../tests/support/nutrition-app.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { MealSlot } from '../domain/meal-slot.constants.ts';
import { InvalidName } from '../domain/name.ts';
import { NotFound } from './nutrition-ports.ts';

async function withOats(app: ReturnType<typeof nutritionApp>) {
	return expectOk(
		await app.createFood.execute({
			name: 'Oats',
			reference: { amount: 100, unit: 'g' },
			macrosPerReference: macros(400, 20, 60, 10)
		})
	);
}

describe('editing foods', () => {
	it('updates a food without changing what was already logged', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		const entry = expectOk(
			await app.logFood.execute({
				foodId: oats.id,
				amount: 100,
				date: app.clock.today(),
				slot: MealSlot.breakfast
			})
		);

		const updated = expectOk(
			await app.updateFood.execute({
				id: oats.id,
				name: 'Rolled oats',
				reference: { amount: 40, unit: 'g' },
				macrosPerReference: macros(150, 5, 27, 3)
			})
		);

		expect(updated.name).toBe('Rolled oats');
		expect(await app.listFoods.execute()).toEqual([updated]);
		expect((await app.getDayNutrition.execute({ date: app.clock.today() })).entries).toEqual([
			entry
		]);
	});

	it('refuses an invalid or missing food', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		const change = {
			name: '',
			reference: oats.reference,
			macrosPerReference: oats.macrosPerReference
		};

		expect(expectErr(await app.updateFood.execute({ ...change, id: oats.id }))).toBeInstanceOf(
			InvalidName
		);
		expect(
			expectErr(await app.updateFood.execute({ ...change, name: 'Rice', id: anId<'Food'>() }))
		).toBeInstanceOf(NotFound);
	});

	it('deletes a food from the list while keeping the days it was logged', async () => {
		const app = nutritionApp();
		const oats = await withOats(app);
		await app.logFood.execute({
			foodId: oats.id,
			amount: 50,
			date: app.clock.today(),
			slot: MealSlot.breakfast
		});

		await app.deleteFood.execute({ id: oats.id });

		expect(await app.listFoods.execute()).toEqual([]);
		expect((await app.getDayNutrition.execute({ date: app.clock.today() })).entries).toHaveLength(
			1
		);
	});
});
