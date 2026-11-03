import { describe, expect, it } from 'vitest';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { firstTracker, number, values } from '../../../../tests/support/tracking-app.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { WorkoutScreen } from './workout-screen.svelte.ts';

const REST_SECONDS = 90;

describe('WorkoutScreen', () => {
	it('copies a set changed just before a new set is added, not what was saved before', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.workouts);
		expectOk(await app.startSession.execute({ trackerId: tracker.id }));
		const squat = expectOk(
			await app.addSubject.execute({
				trackerId: tracker.id,
				name: 'Squat',
				fieldKeys: [],
				defaults: values(['reps', number(10)])
			})
		);
		const screen = new WorkoutScreen(app, app.clock);
		await screen.load(tracker.id);
		await screen.addSet(squat.id, REST_SECONDS);
		const [first] = screen.history;
		if (first === undefined) throw new Error('No set was added');

		const changing = screen.changeSet(first, values(['reps', number(12)]));
		await screen.addSet(squat.id, REST_SECONDS);
		await changing;

		expect(screen.history.map((set) => set.values.get(aKey('reps')))).toEqual([
			number(12),
			number(12)
		]);
	});
});
