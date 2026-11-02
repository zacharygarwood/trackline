import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import type { FieldKey, FieldValue } from './field.ts';
import { InvalidRecipe, perServingOf, type Recipe } from './recipe.ts';
import type { Subject } from './subject.ts';
import { FieldType, RecipeProblem } from './tracking.constants.ts';

const number = (amount: number): FieldValue => ({ type: FieldType.number, amount });
const [calories, protein] = [aKey('calories'), aKey('protein')];

function aFood(name: string, values: readonly (readonly [FieldKey, FieldValue])[]): Subject {
	return {
		id: anId<'Subject'>(),
		trackerId: anId<'Tracker'>(),
		name,
		fieldKeys: [],
		defaults: new Map(values),
		archived: false
	};
}

const oats = aFood('Oats', [
	[calories, number(150)],
	[protein, number(5)],
	[aKey('note'), { type: FieldType.note, text: 'Rolled' }]
]);
const milk = aFood('Milk', [
	[calories, number(100)],
	[protein, number(8)]
]);

describe('perServingOf', () => {
	it('adds up the ingredients and divides by the servings the recipe makes', () => {
		const porridge: Recipe = {
			ingredients: [
				{ foodId: oats.id, servings: 2 },
				{ foodId: milk.id, servings: 1 }
			],
			servings: 2
		};

		const values = expectOk(perServingOf(porridge, [oats, milk]));

		expect(values.get(calories)).toEqual(number(200));
		expect(values.get(protein)).toEqual(number(9));
	});

	it('leaves out values that are not numbers', () => {
		const recipe: Recipe = { ingredients: [{ foodId: oats.id, servings: 1 }], servings: 1 };

		expect(expectOk(perServingOf(recipe, [oats])).has(aKey('note'))).toBe(false);
	});

	it.each([
		['no ingredients', { ingredients: [], servings: 1 }, RecipeProblem.ingredients],
		[
			'an ingredient not in the library',
			{ ingredients: [{ foodId: anId<'Subject'>(), servings: 1 }], servings: 1 },
			RecipeProblem.ingredients
		],
		[
			'no servings of an ingredient',
			{ ingredients: [{ foodId: oats.id, servings: 0 }], servings: 1 },
			RecipeProblem.amount
		],
		[
			'no servings made',
			{ ingredients: [{ foodId: oats.id, servings: 1 }], servings: 0 },
			RecipeProblem.amount
		]
	] as const)('refuses %s', (_, recipe, problem) => {
		expect(expectErr(perServingOf(recipe, [oats]))).toEqual(new InvalidRecipe(problem));
	});
});
