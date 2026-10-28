import { createFood, type Food } from '../../src/lib/nutrition/domain/food.ts';
import type { FoodId } from '../../src/lib/nutrition/domain/ids.ts';
import type { Macros } from '../../src/lib/nutrition/domain/macros.ts';
import { anId } from './training.builder.ts';
import { expectOk } from '../support/result.ts';

/** Macros for tests: `macros(165, 31, 0, 3.6)` is calories, protein, carbs, fat. */
export function macros(calories: number, protein: number, carbs: number, fat: number): Macros {
	return { calories, protein, carbs, fat };
}

/** Builds foods for tests: `aFood('Chicken').per(100, 'g').with(macros(165, 31, 0, 3.6)).build()`. */
export function aFood(name = 'Oats') {
	let id: FoodId = anId<'Food'>();
	let reference = { amount: 100, unit: 'g' };
	let perReference = macros(389, 17, 66, 7);
	const builder = {
		withId(value: FoodId) {
			id = value;
			return builder;
		},
		per(amount: number, unit: string) {
			reference = { amount, unit };
			return builder;
		},
		with(value: Macros) {
			perReference = value;
			return builder;
		},
		build(): Food {
			return expectOk(createFood({ id, name, reference, macrosPerReference: perReference }));
		}
	};
	return builder;
}
