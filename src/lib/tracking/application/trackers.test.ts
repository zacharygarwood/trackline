import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import {
	firstTracker,
	text,
	trackingApp,
	values,
	withTrackers
} from '../../../../tests/support/tracking-app.ts';
import type { Goal } from '../domain/goal.ts';
import { BasicKey, TemplateKey } from '../domain/template.constants.ts';
import { InvalidTracker } from '../domain/tracker.ts';
import { templateOf } from '../domain/from-template.ts';
import { FieldProblem, FieldType, GoalType, TrackerProblem } from '../domain/tracking.constants.ts';
import { MoveDirection } from './move-direction.constants.ts';
import { TrackerNotFound } from './tracking-errors.ts';

describe('adding trackers from templates', () => {
	it('places them after the existing ones, with their starting libraries', async () => {
		const { app, trackers } = await withTrackers(TemplateKey.water, TemplateKey.workouts);
		const more = expectOk(
			await app.addTrackers.execute({
				picks: [
					{
						template: templateOf(TemplateKey.mood),
						text: text('Mood'),
						goal: templateOf(TemplateKey.mood).goal,
						starterNames: []
					}
				]
			})
		);
		const workouts = trackers.at(1)?.id ?? anId<'Tracker'>();

		expect(
			(await app.listTrackers.execute()).map((tracker) => [tracker.name, tracker.position])
		).toEqual([
			['water', 0],
			['workouts', 1],
			['Mood', 2]
		]);
		expect(more.at(0)?.position).toBe(2);
		expect(
			(await app.listSubjects.execute({ trackerId: workouts })).map((subject) => subject.name)
		).toContain('bench_press');
	});

	it('uses the goal the user chose, such as a goal weight', async () => {
		const app = trackingApp();
		const goal: Goal = { type: GoalType.target, field: aKey('weight'), target: 75 };
		const [weight] = expectOk(
			await app.addTrackers.execute({
				picks: [
					{ template: templateOf(TemplateKey.weight), text: text('Weight'), goal, starterNames: [] }
				]
			})
		);

		expect(weight?.goal).toEqual(goal);
	});

	it('gives a plain number field the unit the user typed, such as push-ups in reps', async () => {
		const app = trackingApp();
		const number = templateOf(BasicKey.number);
		const [pushUps] = expectOk(
			await app.addTrackers.execute({
				picks: [
					{
						template: number,
						text: text('Push-ups'),
						goal: number.goal,
						starterNames: [],
						renames: [{ key: 'amount', label: 'amount', unit: ' reps ' }]
					}
				]
			})
		);
		const amount = pushUps?.fields.at(0);

		expect(amount?.type === FieldType.number && amount.unit).toBe('reps');
	});

	it('adds nothing when a goal does not fit', async () => {
		const app = trackingApp();
		const goal: Goal = { type: GoalType.target, field: aKey('missing'), target: 75 };
		const problem = expectErr(
			await app.addTrackers.execute({
				picks: [
					{ template: templateOf(TemplateKey.weight), text: text('Weight'), goal, starterNames: [] }
				]
			})
		);

		expect(problem.problem).toBe(TrackerProblem.goal);
		expect(await app.listTrackers.execute()).toEqual([]);
	});
});

describe('editing trackers', () => {
	it('renames a tracker and changes its goal', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);
		const goal = { ...tracker.goal, target: 10 };
		const updated = expectOk(
			await app.updateTracker.execute({ id: tracker.id, name: ' Drink ', goal })
		);

		expect([updated.name, updated.goal.target]).toEqual(['Drink', 10]);
		expect(await app.getTracker.execute({ id: tracker.id })).toEqual(updated);
		expect(
			expectErr(await app.updateTracker.execute({ id: anId(), name: 'X', goal }))
		).toBeInstanceOf(TrackerNotFound);
	});

	it('renames a number field and changes its unit, keeping what was logged', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);
		const updated = expectOk(
			await app.updateTracker.execute({
				id: tracker.id,
				name: tracker.name,
				goal: tracker.goal,
				renames: [{ key: 'glasses', label: 'Water', unit: 'oz' }]
			})
		);
		const water = updated.fields.at(0);

		expect(water?.label).toBe('Water');
		expect(water?.type === FieldType.number && water.unit).toBe('oz');
	});

	it('rejects a unit that is too long', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);
		const problem = expectErr(
			await app.updateTracker.execute({
				id: tracker.id,
				name: tracker.name,
				goal: tracker.goal,
				renames: [{ key: 'glasses', label: 'Water', unit: 'x'.repeat(21) }]
			})
		);

		expect(problem).toEqual(new InvalidTracker(FieldProblem.unit, 'glasses'));
	});

	it('moves a tracker on Home, staying put at the ends', async () => {
		const { app, trackers } = await withTrackers(
			TemplateKey.water,
			TemplateKey.coffee,
			TemplateKey.steps
		);
		const coffee = trackers.at(1)?.id ?? anId<'Tracker'>();
		const names = async () => (await app.listTrackers.execute()).map((tracker) => tracker.name);

		await app.moveTracker.execute({ id: coffee, direction: MoveDirection.up });
		expect(await names()).toEqual(['coffee', 'water', 'steps']);
		await app.moveTracker.execute({ id: coffee, direction: MoveDirection.up });
		expect(await names()).toEqual(['coffee', 'water', 'steps']);
		await app.moveTracker.execute({ id: coffee, direction: MoveDirection.down });
		expect(await names()).toEqual(['water', 'coffee', 'steps']);
	});

	it('deletes a tracker with its entries and photos, closing the gap on Home', async () => {
		const { app, trackers } = await withTrackers(TemplateKey.bodyPhotos, TemplateKey.water);
		const photos = trackers.at(0)?.id ?? anId<'Tracker'>();
		const photoId = expectOk(await app.savePhoto.execute({ image: Uint8Array.of(9) }));
		expectOk(
			await app.logEntry.execute({
				trackerId: photos,
				values: values(['photo', { type: FieldType.photo, photoId }])
			})
		);
		await app.deleteTracker.execute({ id: photos });

		expect((await app.listTrackers.execute()).map((tracker) => tracker.position)).toEqual([0]);
		expect(app.photos.files.size).toBe(0);
		expect(await app.listEntries.execute({ trackerId: photos })).toEqual([]);
	});
});
