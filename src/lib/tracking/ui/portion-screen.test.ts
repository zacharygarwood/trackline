import { describe, expect, it } from 'vitest';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { DATABASE_OATS } from '../../../../tests/fakes/in-memory-food-database.ts';
import { firstTracker, number } from '../../../../tests/support/tracking-app.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { PortionScreen } from './portion-screen.svelte.ts';

async function databaseOats() {
	const { app, tracker } = await firstTracker(TemplateKey.food);
	const screen = new PortionScreen(app);
	const loaded = await screen.load({ tracker: tracker.id, food: DATABASE_OATS.id });
	return { app, tracker, screen, loaded };
}

describe('PortionScreen for a food from the food database', () => {
	it('offers 100 g and the food’s own portions, starting with 100 g', async () => {
		const { screen, loaded } = await databaseOats();

		expect(loaded).toBe(true);
		expect(screen.name).toBe(DATABASE_OATS.name);
		expect(screen.servingChoices.map((choice) => choice.label)).toEqual(['100 g', '1 cup']);
		expect(screen.values.ok && screen.values.value.get(aKey('calories'))).toEqual(number(379));
	});

	it('logs the chosen serving and keeps the food in My foods', async () => {
		const { app, tracker, screen } = await databaseOats();
		screen.chooseServing('1 cup');
		screen.servings = '2';

		expect(await screen.save()).toBe(true);

		const [saved] = await app.listSubjects.execute({ trackerId: tracker.id });
		expect(saved?.name).toBe(`${DATABASE_OATS.name}, 1 cup`);
		const [entry] = await app.listEntries.execute({ trackerId: tracker.id });
		expect(entry?.subjectId).toBe(saved?.id);
		expect(entry?.values.get(aKey('calories'))).toEqual(number(613.98));
		expect(entry?.values.get(aKey('servings'))).toEqual(number(2));
	});

	it('finds nothing to log for a food not in the database', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.food);

		expect(await new PortionScreen(app).load({ tracker: tracker.id, food: 'nope' })).toBe(false);
	});
});
