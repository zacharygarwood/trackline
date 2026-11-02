import { describe, expect, it } from 'vitest';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { firstTracker, number, values } from '../../../../tests/support/tracking-app.ts';
import { InvalidRecipe } from '../domain/recipe.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { RecipeProblem } from '../domain/tracking.constants.ts';

describe('recipes', () => {
	it('works out a recipe’s numbers per serving from its ingredients', async () => {
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
		const recipe = {
			ingredients: [
				{ foodId: oats.id, servings: 2 },
				{ foodId: milk.id, servings: 1 }
			],
			servings: 2
		};

		const porridge = expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name: 'Porridge',
				fieldKeys: [],
				recipe
			})
		);
		const halved = expectOk(
			await app.updateSubject.execute({
				id: porridge.id,
				name: 'Porridge',
				fieldKeys: [],
				recipe: { ...recipe, servings: 4 }
			})
		);

		expect(porridge.defaults.get(aKey('calories'))).toEqual(number(200));
		expect(halved.defaults.get(aKey('calories'))).toEqual(number(100));
		expect((await app.getSubject.execute({ id: porridge.id }))?.recipe).toEqual({
			...recipe,
			servings: 4
		});
	});

	it('refuses a recipe made of itself', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.food);
		const oats = expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name: 'Oats',
				fieldKeys: [],
				defaults: values(['calories', number(150)])
			})
		);
		const porridge = expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name: 'Porridge',
				fieldKeys: [],
				recipe: { ingredients: [{ foodId: oats.id, servings: 1 }], servings: 1 }
			})
		);

		expect(
			expectErr(
				await app.updateSubject.execute({
					id: porridge.id,
					name: 'Porridge',
					fieldKeys: [],
					recipe: { ingredients: [{ foodId: porridge.id, servings: 1 }], servings: 1 }
				})
			)
		).toEqual(new InvalidRecipe(RecipeProblem.ingredients));
	});
});
