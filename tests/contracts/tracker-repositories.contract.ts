import { describe, expect, it } from 'vitest';
import type {
	TrackerEntryReader,
	TrackerEntryWriter,
	TrackerReader,
	TrackerSetup,
	TrackerWriter
} from '../../src/lib/trackers/domain/tracker-repository.ts';
import { Measure } from '../../src/lib/trackers/domain/tracker.constants.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { aTracker } from '../builders/tracker.builder.ts';
import { anId } from '../builders/training.builder.ts';
import { expectOk } from '../support/result.ts';

/** Repositories that store trackers, sharing one database. */
export interface TrackerRepositories {
	readonly trackers: TrackerReader & TrackerWriter;
	readonly entries: TrackerEntryReader & TrackerEntryWriter;
	readonly setup: TrackerSetup;
}

const date = (text: string) => expectOk(LocalDate.parse(text));

/** The behavior every tracker repository must have, for the fakes and for SQLite. */
export function describeTrackerRepositories(create: () => Promise<TrackerRepositories>): void {
	describe('tracker repository contract', () => {
		it('round-trips trackers in Home order and updates them together', async () => {
			const { trackers } = await create();
			const water = aTracker({ position: 1 });
			const run = aTracker({
				name: 'Run',
				position: 0,
				measure: Measure.distance,
				subjectId: 'exercise',
				unit: ''
			});
			await trackers.save([water, run]);
			await trackers.save([
				{ ...water, position: 0 },
				{ ...run, position: 1 }
			]);

			expect(await trackers.findAll()).toEqual([
				{ ...water, position: 0 },
				{ ...run, position: 1 }
			]);
			expect(await trackers.findById(run.id)).toEqual({ ...run, position: 1 });
		});

		it('lists entries since a day and the latest of one tracker, and deletes with the tracker', async () => {
			const { trackers, entries } = await create();
			const water = aTracker();
			const sleep = aTracker({ name: 'Sleep', position: 1 });
			await trackers.save([water, sleep]);
			const entry = (trackerId = water.id, day = '2026-10-28', value = 1) => ({
				id: anId<'TrackerEntry'>(),
				trackerId,
				date: date(day),
				value
			});
			const old = entry(water.id, '2026-10-01');
			const recent = entry(water.id, '2026-10-28', 2);
			const other = entry(sleep.id, '2026-10-29', 7);
			for (const each of [old, recent, other]) await entries.save(each);

			expect(await entries.findSince(date('2026-10-27'))).toEqual([recent, other]);
			expect(await entries.findLatest(water.id, 1)).toEqual([recent]);
			await entries.delete(other.id);
			await trackers.delete(water.id);
			expect(await entries.findSince(date('2026-01-01'))).toEqual([]);
		});

		it('remembers that the starting trackers were made', async () => {
			const { setup } = await create();

			expect(await setup.isSeeded()).toBe(false);
			await setup.markSeeded();
			await setup.markSeeded();
			expect(await setup.isSeeded()).toBe(true);
		});
	});
}
