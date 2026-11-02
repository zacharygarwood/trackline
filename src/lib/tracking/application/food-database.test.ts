import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { DATABASE_OATS } from '../../../../tests/fakes/in-memory-food-database.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { firstTracker, number } from '../../../../tests/support/tracking-app.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { DatabaseFoodNotFound, TrackerNotFound } from './tracking-errors.ts';

const cup = { foodId: DATABASE_OATS.id, name: 'Oats, 1 cup', grams: 81 };

describe('food database', () => {
	it('finds foods by the words typed', async () => {
		const { app } = await firstTracker(TemplateKey.food);

		expect(await app.searchFoods.execute({ text: 'oats dry' })).toEqual([DATABASE_OATS]);
		expect(await app.getDatabaseFood.execute({ id: DATABASE_OATS.id })).toEqual(DATABASE_OATS);
	});

	it('saves a database food to My foods with its numbers for one serving', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.food);

		const oats = expectOk(await app.saveDatabaseFood.execute({ ...cup, trackerId: tracker.id }));

		expect(oats.name).toBe('Oats, 1 cup');
		expect(oats.defaults.get(aKey('calories'))).toEqual(number(306.99));
		expect(oats.defaults.get(aKey('sodium'))).toEqual(number(4.86));
		expect(await app.listSubjects.execute({ trackerId: tracker.id })).toEqual([oats]);
	});

	it('uses the food already saved under that name instead of saving it twice', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.food);
		const first = expectOk(await app.saveDatabaseFood.execute({ ...cup, trackerId: tracker.id }));

		const again = expectOk(await app.saveDatabaseFood.execute({ ...cup, trackerId: tracker.id }));

		expect(again).toEqual(first);
		expect(await app.listSubjects.execute({ trackerId: tracker.id })).toHaveLength(1);
	});

	it('refuses a food that is not in the database, or an unknown tracker', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.food);

		expect(
			expectErr(
				await app.saveDatabaseFood.execute({ ...cup, foodId: 'nope', trackerId: tracker.id })
			)
		).toBeInstanceOf(DatabaseFoodNotFound);
		expect(
			expectErr(await app.saveDatabaseFood.execute({ ...cup, trackerId: anId<'Tracker'>() }))
		).toBeInstanceOf(TrackerNotFound);
	});
});
