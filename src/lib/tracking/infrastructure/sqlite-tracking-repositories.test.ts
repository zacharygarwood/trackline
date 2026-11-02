import { describe, expect, it } from 'vitest';
import { describeTrackingRepositories } from '../../../../tests/contracts/tracking-repositories.contract.ts';
import { aWorkoutTracker, anEntry, aTracker } from '../../../../tests/builders/tracking.builder.ts';
import { migratedDatabase } from '../../../../tests/support/migrated-database.ts';
import { TestDatabase } from '../../../../tests/support/test-database.ts';
import { bundledMigrations } from '../../platform/db/bundled-migrations.ts';
import { migrate } from '../../platform/db/migrate.ts';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { daysAWeek } from '../domain/goal-parts.ts';
import {
	SqliteEntryRepository,
	SqliteSessionRepository,
	SqliteSubjectRepository,
	SqliteTrackerRepository
} from './sqlite-tracking-repositories.ts';
import { entryMapper, sessionMapper, subjectMapper, trackerMapper } from './tracking.mapper.ts';

describeTrackingRepositories(async () => {
	const database = await migratedDatabase();
	return {
		trackers: new SqliteTrackerRepository(database),
		subjects: new SqliteSubjectRepository(database),
		sessions: new SqliteSessionRepository(database),
		entries: new SqliteEntryRepository(database)
	};
});

describe('tracking mappers', () => {
	it('round-trip trackers with different kinds of goal', () => {
		for (const tracker of [aTracker(), aWorkoutTracker()]) {
			expect(trackerMapper.toDomain(trackerMapper.toRow(tracker))).toEqual({
				ok: true,
				value: tracker
			});
		}
	});

	it('round-trip an entry', () => {
		const entry = anEntry({ values: [[aTracker().goal.field ?? never(), { type: 'check' }]] });

		expect(entryMapper.toDomain(entryMapper.toRow(entry))).toEqual({ ok: true, value: entry });
	});

	it.each([
		[
			'tracker',
			() => trackerMapper.toDomain({ ...trackerMapper.toRow(aTracker()), fields: '[{}]' })
		],
		[
			'tracker goal',
			() => trackerMapper.toDomain({ ...trackerMapper.toRow(aTracker()), goal: '{}' })
		],
		[
			'tracker kind',
			() => trackerMapper.toDomain({ ...trackerMapper.toRow(aTracker()), kind: 'x' })
		],
		[
			'entry values',
			() => entryMapper.toDomain({ ...entryMapper.toRow(anEntry()), field_values: '{}' })
		],
		[
			'entry value',
			() =>
				entryMapper.toDomain({
					...entryMapper.toRow(anEntry()),
					field_values: '{"a":{"type":"x"}}'
				})
		],
		[
			'entry json',
			() => entryMapper.toDomain({ ...entryMapper.toRow(anEntry()), field_values: 'nope' })
		],
		[
			'subject archived',
			() =>
				subjectMapper.toDomain({
					id: anEntry().id,
					tracker_id: aTracker().id,
					name: 'A',
					field_keys: '[]',
					defaults: '{}',
					archived: 2
				})
		],
		[
			'subject keys',
			() =>
				subjectMapper.toDomain({
					id: anEntry().id,
					tracker_id: aTracker().id,
					name: 'A',
					field_keys: '["Bad key"]',
					defaults: '{}',
					archived: 0
				})
		],
		[
			'subject recipe',
			() =>
				subjectMapper.toDomain({
					id: anEntry().id,
					tracker_id: aTracker().id,
					name: 'A',
					field_keys: '[]',
					defaults: '{}',
					archived: 0,
					recipe: '{"ingredients":[{"foodId":"nope","servings":1}],"servings":1}'
				})
		],
		[
			'session end',
			() =>
				sessionMapper.toDomain({
					id: anEntry().id,
					tracker_id: aTracker().id,
					date: '2026-10-29',
					started_at: 5,
					finished_at: 1
				})
		]
	])('reject a corrupt %s', (_, map) => {
		expect(map().ok).toBe(false);
	});
});

function never(): never {
	throw new Error('The test tracker has a field goal');
}

describe('migration 0011', () => {
	it('gives a tracker saved without a goal the goal of 7 days a week, so Home can read it', async () => {
		const database = new TestDatabase();
		const tracker = aTracker();
		await migrate(
			database,
			bundledMigrations.filter((migration) => migration.version <= 10)
		);
		await new SqliteTrackerRepository(database).save([tracker]);
		await database.execute({
			name: 'clear goal',
			sql: 'UPDATE tracker SET goal = NULL',
			params: []
		});

		await migrate(database, bundledMigrations);

		expect(await new SqliteTrackerRepository(database).findAll()).toEqual([
			{ ...tracker, goal: daysAWeek(7) }
		]);
	});
});

describe('migration 0013', () => {
	it('keeps every thing and the entries about it, and takes a long food name after', async () => {
		const database = new TestDatabase();
		const workouts = aWorkoutTracker();
		const squat = {
			id: anId<'Subject'>(),
			trackerId: workouts.id,
			name: 'Squat',
			fieldKeys: [],
			defaults: new Map(),
			archived: false
		};
		const set = anEntry({ trackerId: workouts.id, subjectId: squat.id });
		await migrate(
			database,
			bundledMigrations.filter((migration) => migration.version <= 12)
		);
		await new SqliteTrackerRepository(database).save([workouts]);
		await new SqliteSubjectRepository(database).save([squat]);
		await new SqliteEntryRepository(database).save(set);

		await migrate(database, bundledMigrations);
		const subjects = new SqliteSubjectRepository(database);
		const long = { ...squat, id: anId<'Subject'>(), name: 'x'.repeat(240) };
		await subjects.save([long]);

		expect(await new SqliteEntryRepository(database).findFor(workouts.id)).toEqual([set]);
		expect((await subjects.findFor(workouts.id)).map((subject) => subject.id)).toEqual([
			squat.id,
			long.id
		]);
	});
});
