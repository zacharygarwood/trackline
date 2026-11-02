import { describe, expect, it } from 'vitest';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import type { FieldKey, FieldValue } from '../../src/lib/tracking/domain/field.ts';
import { finishSession, type ActiveSession } from '../../src/lib/tracking/domain/session.ts';
import type { Subject } from '../../src/lib/tracking/domain/subject.ts';
import { SessionState, TrackerKind } from '../../src/lib/tracking/domain/tracking.constants.ts';
import type {
	EntryReader,
	EntryWriter,
	SessionReader,
	SessionWriter,
	SubjectReader,
	SubjectWriter,
	TrackerReader,
	TrackerWriter
} from '../../src/lib/tracking/domain/tracking-repositories.ts';
import { anId } from '../builders/id.builder.ts';
import { aKey, anEntry, aTracker, aWorkoutTracker } from '../builders/tracking.builder.ts';
import { expectOk } from '../support/result.ts';

/** Repositories that store tracking, sharing one database. */
export interface TrackingRepositories {
	readonly trackers: TrackerReader & TrackerWriter;
	readonly subjects: SubjectReader & SubjectWriter;
	readonly sessions: SessionReader & SessionWriter;
	readonly entries: EntryReader & EntryWriter;
}

const date = (text: string) => expectOk(LocalDate.parse(text));

/** The behavior every tracking repository must have, for the fakes and for SQLite. */
export function describeTrackingRepositories(create: () => Promise<TrackingRepositories>): void {
	describe('tracking repository contract', () => {
		const workouts = aWorkoutTracker();
		const squat = (name = 'Squat'): Subject => ({
			id: anId<'Subject'>(),
			trackerId: workouts.id,
			name,
			fieldKeys: [aKey('reps'), aKey('weight')],
			defaults: new Map<FieldKey, FieldValue>([[aKey('reps'), { type: 'number', amount: 5 }]]),
			archived: false
		});
		const started = (startedAt: number): ActiveSession => ({
			state: SessionState.active,
			id: anId<'Session'>(),
			trackerId: workouts.id,
			date: date('2026-10-29'),
			startedAt
		});

		it('round-trips trackers in Home order and updates them together', async () => {
			const { trackers } = await create();
			const water = aTracker({ id: anId<'Tracker'>(), position: 1 });
			const lifting = { ...workouts, position: 0 };
			await trackers.save([water, lifting]);
			await trackers.save([
				{ ...water, position: 0, name: 'Drink' },
				{ ...lifting, position: 1 }
			]);

			expect(await trackers.findAll()).toEqual([
				{ ...water, position: 0, name: 'Drink' },
				{ ...lifting, position: 1 }
			]);
			expect(await trackers.findById(water.id)).toEqual({ ...water, position: 0, name: 'Drink' });
			expect(await trackers.findById(anId<'Tracker'>())).toBeUndefined();
		});

		it('keeps a library by name, deleted things included', async () => {
			const { trackers, subjects } = await create();
			await trackers.save([workouts]);
			const [bench, row] = [squat('bench'), squat('Row')];
			await subjects.save([row, bench]);
			await subjects.save([{ ...row, archived: true }]);

			expect(await subjects.findFor(workouts.id)).toEqual([bench, { ...row, archived: true }]);
			expect(await subjects.findById(bench.id)).toEqual(bench);
		});

		it('keeps what a recipe is made of, until it becomes a plain thing again', async () => {
			const { trackers, subjects } = await create();
			await trackers.save([workouts]);
			const [oats, porridge] = [squat('Oats'), squat('Porridge')];
			const recipe = { ingredients: [{ foodId: oats.id, servings: 1.5 }], servings: 2 };
			await subjects.save([oats, { ...porridge, recipe }]);

			expect((await subjects.findById(porridge.id))?.recipe).toEqual(recipe);

			await subjects.save([porridge]);

			expect((await subjects.findById(porridge.id))?.recipe).toBeUndefined();
		});

		it('lists sessions newest first, finished or not', async () => {
			const { trackers, sessions } = await create();
			await trackers.save([workouts]);
			const [older, newer] = [started(1000), started(2000)];
			await sessions.save(older);
			await sessions.save(newer);
			await sessions.save(finishSession(older, 1500));

			expect(await sessions.findFor(workouts.id)).toEqual([newer, finishSession(older, 1500)]);
			expect(await sessions.findById(newer.id)).toEqual(newer);
		});

		it('lists entries oldest first, since a day or for one tracker', async () => {
			const { trackers, entries } = await create();
			const water = aTracker({ id: anId<'Tracker'>() });
			await trackers.save([water, workouts]);
			const late = anEntry({ trackerId: water.id, date: '2026-10-29', loggedAt: 9 });
			const early = anEntry({ trackerId: water.id, date: '2026-10-29', loggedAt: 1 });
			const before = anEntry({ trackerId: water.id, date: '2026-10-27' });
			for (const entry of [late, early, before]) await entries.save(entry);

			expect(await entries.findSince(date('2026-10-28'))).toEqual([early, late]);
			expect(await entries.findFor(water.id)).toEqual([before, early, late]);
			await entries.delete(early.id);
			expect(await entries.findById(early.id)).toBeUndefined();
			expect(await entries.findById(late.id)).toEqual(late);
		});

		it('keeps an entry about a thing in a session, and removes it with its session', async () => {
			const { trackers, subjects, sessions, entries } = await create();
			await trackers.save([workouts]);
			const [lift, session] = [squat(), started(1000)];
			await subjects.save([lift]);
			await sessions.save(session);
			const set = anEntry({
				trackerId: workouts.id,
				subjectId: lift.id,
				sessionId: session.id,
				values: [[aKey('reps'), { type: 'number', amount: 5 }]]
			});
			await entries.save(set);

			expect(await entries.findFor(workouts.id)).toEqual([set]);
			await sessions.delete(session.id);
			expect(await entries.findFor(workouts.id)).toEqual([]);
		});

		it('keeps a session’s entries when it is finished', async () => {
			const { trackers, sessions, entries } = await create();
			await trackers.save([workouts]);
			const session = started(1000);
			await sessions.save(session);
			const set = anEntry({ trackerId: workouts.id, sessionId: session.id });
			await entries.save(set);
			await sessions.save(finishSession(session, 2000));

			expect(await entries.findFor(workouts.id)).toEqual([set]);
		});

		it('removes a tracker with its library, sessions, and entries', async () => {
			const { trackers, subjects, sessions, entries } = await create();
			await trackers.save([workouts]);
			const [lift, session] = [squat(), started(1000)];
			await subjects.save([lift]);
			await sessions.save(session);
			await entries.save(anEntry({ trackerId: workouts.id, sessionId: session.id }));
			await trackers.delete(workouts.id);

			expect(await trackers.findAll()).toEqual([]);
			expect(await subjects.findFor(workouts.id)).toEqual([]);
			expect(await sessions.findFor(workouts.id)).toEqual([]);
			expect(await entries.findFor(workouts.id)).toEqual([]);
		});

		it('keeps every kind of value', async () => {
			const { trackers, entries } = await create();
			const tracker = aTracker({ id: anId<'Tracker'>(), kind: TrackerKind.log });
			await trackers.save([tracker]);
			const entry = anEntry({
				trackerId: tracker.id,
				values: [
					[aKey('a'), { type: 'number', amount: 2.5 }],
					[aKey('b'), { type: 'duration', seconds: 90 }],
					[aKey('c'), { type: 'rating', stars: 4 }],
					[aKey('d'), { type: 'check' }],
					[aKey('e'), { type: 'choice', option: 'Calm' }],
					[aKey('f'), { type: 'note', text: 'Hi "there"' }],
					[aKey('g'), { type: 'photo', photoId: anId<'Photo'>() }]
				]
			});
			await entries.save(entry);

			expect(await entries.findById(entry.id)).toEqual(entry);
		});
	});
}
