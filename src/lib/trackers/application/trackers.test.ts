import { describe, expect, it } from 'vitest';
import { aTrackerCommand } from '../../../../tests/builders/tracker.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { trackersApp } from '../../../../tests/support/trackers-app.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { Combine, Measure, Period, TrackerField } from '../domain/tracker.constants.ts';
import { InvalidEntryValue, InvalidTracker } from '../domain/tracker.ts';
import { TrackerMove } from './arrange-trackers.ts';
import { TrackerNotFound } from './tracker-ports.ts';

const names = async (app: ReturnType<typeof trackersApp>) =>
	(await app.listTrackerProgress.execute({ weekStart: WeekStart.monday })).map(
		(progress) => progress.tracker.name
	);

describe('managing trackers', () => {
	it('adds trackers at the end, changes one in place, moves, and deletes', async () => {
		const app = trackersApp();
		const water = expectOk(await app.saveTracker.execute(aTrackerCommand()));
		const sleep = expectOk(await app.saveTracker.execute(aTrackerCommand({ name: 'Sleep' })));
		await app.saveTracker.execute({ ...aTrackerCommand(), id: water.id, name: 'Drink water' });
		await app.moveTracker.execute({ id: sleep.id, move: TrackerMove.up });
		await app.moveTracker.execute({ id: sleep.id, move: TrackerMove.up });

		expect(await names(app)).toEqual(['Sleep', 'Drink water']);
		await app.deleteTracker.execute({ id: sleep.id });
		const left = await app.listTrackerProgress.execute({ weekStart: WeekStart.monday });
		expect(left.map((progress) => [progress.tracker.name, progress.tracker.position])).toEqual([
			['Drink water', 0]
		]);
	});

	it('refuses an invalid tracker or one that no longer exists', async () => {
		const app = trackersApp();

		expect(expectErr(await app.saveTracker.execute(aTrackerCommand({ goal: -1 })))).toEqual(
			new InvalidTracker(TrackerField.goal)
		);
		expect(
			expectErr(await app.saveTracker.execute({ ...aTrackerCommand(), id: anId<'Tracker'>() }))
		).toBeInstanceOf(TrackerNotFound);
	});

	it('makes the starting trackers once, even after they are all deleted', async () => {
		const app = trackersApp();
		const starting = [aTrackerCommand({ name: 'Calories', measure: Measure.calories, unit: '' })];

		expect(await app.seedTrackers.execute({ trackers: starting })).toBe(true);
		const [calories] = await app.listTrackerProgress.execute({ weekStart: WeekStart.monday });
		await app.deleteTracker.execute({ id: calories?.tracker.id ?? anId<'Tracker'>() });

		expect(await app.seedTrackers.execute({ trackers: starting })).toBe(false);
		expect(await names(app)).toEqual([]);
	});
});

describe('tracker progress', () => {
	it('reads the food log, workouts, and weigh-ins for their period', async () => {
		const app = trackersApp();
		app.sources.macros = { protein: 90 };
		app.sources.workouts = 2;
		app.sources.exercise = 5000;
		app.sources.weighIns = [82, 81, 80];
		const squat = 'exercise-id';
		for (const tracker of [
			aTrackerCommand({ name: 'Protein', measure: Measure.protein, goal: 150 }),
			aTrackerCommand({
				name: 'Workouts',
				measure: Measure.workouts,
				goal: 4,
				period: Period.week
			}),
			aTrackerCommand({
				name: 'Run',
				measure: Measure.distance,
				subjectId: squat,
				goal: 10_000,
				period: Period.week
			}),
			aTrackerCommand({ name: 'Weight', measure: Measure.weight, goal: 78 })
		]) {
			await app.saveTracker.execute(tracker);
		}

		const progress = await app.listTrackerProgress.execute({ weekStart: WeekStart.monday });

		expect(progress.map(({ value, fill }) => [value, fill])).toEqual([
			[90, 0.6],
			[2, 0.5],
			[5000, 0.5],
			[80, 0.5]
		]);
		expect(app.sources.calls).toEqual([
			'protein since 2026-10-29',
			'workouts since 2026-10-26',
			'distance of exercise-id since 2026-10-26'
		]);
	});

	it('has no weight value before the first weigh-in', async () => {
		const app = trackersApp();
		await app.saveTracker.execute(aTrackerCommand({ measure: Measure.weight, goal: 78 }));

		expect(await app.listTrackerProgress.execute({ weekStart: WeekStart.monday })).toMatchObject([
			{ value: undefined, fill: 0 }
		]);
	});
});

describe('logging', () => {
	it('logs values today, lists the latest, and removes and restores one', async () => {
		const app = trackersApp();
		const sleep = expectOk(
			await app.saveTracker.execute(aTrackerCommand({ name: 'Sleep', combine: Combine.average }))
		);
		const first = expectOk(await app.logTrackerEntry.execute({ trackerId: sleep.id, value: 6 }));
		await app.logTrackerEntry.execute({ trackerId: sleep.id, value: 8 });

		await app.deleteTrackerEntry.execute({ id: first.id });
		const [progress] = await app.listTrackerProgress.execute({ weekStart: WeekStart.monday });
		await app.restoreTrackerEntry.execute({ entry: first });

		expect(progress?.value).toBe(8);
		expect(
			(await app.listTrackerEntries.execute({ trackerId: sleep.id })).map((entry) => entry.value)
		).toEqual([8, 6]);
		expect(await app.listTrackerEntries.execute({ since: app.clock.today() })).toHaveLength(2);
	});

	it('refuses an invalid value or a missing tracker', async () => {
		const app = trackersApp();
		const mood = expectOk(
			await app.saveTracker.execute(aTrackerCommand({ measure: Measure.rating, goal: 4 }))
		);

		expect(
			expectErr(await app.logTrackerEntry.execute({ trackerId: mood.id, value: 7 }))
		).toBeInstanceOf(InvalidEntryValue);
		expect(
			expectErr(await app.logTrackerEntry.execute({ trackerId: anId<'Tracker'>(), value: 1 }))
		).toBeInstanceOf(TrackerNotFound);
	});
});
