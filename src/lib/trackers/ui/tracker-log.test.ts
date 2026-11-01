import { describe, expect, it } from 'vitest';
import { aTrackerCommand } from '../../../../tests/builders/tracker.builder.ts';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { expectOk } from '../../../../tests/support/result.ts';
import { trackersApp } from '../../../../tests/support/trackers-app.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { TrackerLog } from './tracker-log.svelte.ts';

describe('TrackerLog', () => {
	it('logs today, totals the day, and removes and restores an entry', async () => {
		const app = trackersApp();
		const water = expectOk(await app.saveTracker.execute(aTrackerCommand()));
		const log = new TrackerLog(app, app.clock, WeekStart.monday);

		expect(await log.load(water.id)).toBe(true);
		expect(log.loggedToday).toBe(false);
		const entry = await log.log(2);
		await log.log(3);
		expect([log.value, log.entries.length, log.loggedToday]).toEqual([5, 2, true]);

		const undo = entry === undefined ? undefined : await log.remove(entry);
		expect(log.value).toBe(3);
		await undo?.();
		expect(log.value).toBe(5);
		expect(await log.log(-1)).toBeUndefined();
	});

	it('reports a tracker that no longer exists', async () => {
		const app = trackersApp();

		expect(await new TrackerLog(app, app.clock, WeekStart.monday).load(anId<'Tracker'>())).toBe(
			false
		);
	});
});
