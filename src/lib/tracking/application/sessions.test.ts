import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import {
	firstTracker,
	number,
	values,
	withTrackers
} from '../../../../tests/support/tracking-app.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { TemplateKey } from '../domain/template.constants.ts';
import { FieldType, SessionState } from '../domain/tracking.constants.ts';
import { SessionNotFound, TrackerNotFound } from './tracking-errors.ts';

const weekStart = WeekStart.monday;

describe('sessions', () => {
	async function workout() {
		const { app, tracker } = await firstTracker(TemplateKey.workouts);
		const squat = (await app.listSubjects.execute({ trackerId: tracker.id })).find(
			(subject) => subject.name === 'squat'
		);
		if (squat === undefined) throw new Error('No squat in the starting library');
		return { app, tracker, squat };
	}

	it('starts one workout at a time, logs sets to it, and finishes it', async () => {
		const { app, tracker, squat } = await workout();
		const session = expectOk(await app.startSession.execute({ trackerId: tracker.id }));
		expect(expectOk(await app.startSession.execute({ trackerId: tracker.id }))).toEqual(session);
		const set = expectOk(
			await app.logEntry.execute({
				trackerId: tracker.id,
				subjectId: squat.id,
				sessionId: session.id,
				values: values(['reps', number(5)], ['weight', number(100)])
			})
		);
		app.clock.advance(60_000);
		const finished = expectOk(await app.finishSession.execute({ id: session.id }));

		expect(finished).toMatchObject({
			state: SessionState.finished,
			finishedAt: session.startedAt + 60_000
		});
		expect(await app.listSessions.execute({ trackerId: tracker.id })).toEqual({
			active: undefined,
			finished: [finished]
		});
		expect(await app.listEntries.execute({ trackerId: tracker.id, sessionId: session.id })).toEqual(
			[set]
		);
		expect(await app.getSession.execute({ id: session.id })).toEqual(finished);
	});

	it('discards a workout finished with nothing logged', async () => {
		const { app, tracker } = await workout();
		const session = expectOk(await app.startSession.execute({ trackerId: tracker.id }));

		expect(expectOk(await app.finishSession.execute({ id: session.id }))).toBeUndefined();
		expect(await app.listSessions.execute({ trackerId: tracker.id })).toEqual({
			active: undefined,
			finished: []
		});
		expect(expectErr(await app.finishSession.execute({ id: session.id }))).toBeInstanceOf(
			SessionNotFound
		);
	});

	it('refuses sets for a finished workout, and throws a discarded workout away with its sets', async () => {
		const { app, tracker, squat } = await workout();
		const log = (sessionId: typeof session.id) =>
			app.logEntry.execute({
				trackerId: tracker.id,
				subjectId: squat.id,
				sessionId,
				values: values(['reps', number(5)])
			});
		const session = expectOk(await app.startSession.execute({ trackerId: tracker.id }));
		expectOk(await log(session.id));
		await app.discardSession.execute({ id: session.id });

		expect(await app.listEntries.execute({ trackerId: tracker.id })).toEqual([]);
		expect(expectErr(await log(session.id))).toBeInstanceOf(SessionNotFound);
	});

	it('only starts sessions for trackers that have them', async () => {
		const { app, tracker } = await firstTracker(TemplateKey.water);

		expect((await app.startSession.execute({ trackerId: tracker.id })).ok).toBe(false);
		expect(expectErr(await app.startSession.execute({ trackerId: anId() }))).toBeInstanceOf(
			TrackerNotFound
		);
	});
});

describe('Home and Stats', () => {
	it('shows each tracker’s progress, latest entry, and a workout under way', async () => {
		const { app, trackers } = await withTrackers(
			TemplateKey.water,
			TemplateKey.mood,
			TemplateKey.workouts
		);
		const [water, mood, workouts] = trackers.map((tracker) => tracker.id);
		if (water === undefined || mood === undefined || workouts === undefined)
			throw new Error('Missing trackers');
		app.clock.setToday('2026-10-28');
		await app.logEntry.execute({ trackerId: water, values: values(['glasses', number(5)]) });
		app.clock.setToday('2026-10-29');
		await app.logEntry.execute({ trackerId: water, values: values(['glasses', number(3)]) });
		await app.logEntry.execute({
			trackerId: mood,
			values: values(['mood', { type: FieldType.rating, stars: 4 }])
		});
		const session = expectOk(await app.startSession.execute({ trackerId: workouts }));

		const rows = await app.listHome.execute({ weekStart });

		expect(rows.map((row) => row.progress.value)).toEqual([3, 1, 0]);
		expect(rows.at(2)?.active).toEqual(session);
	});

	it('charts every tracker', async () => {
		const { app, trackers } = await withTrackers(TemplateKey.water, TemplateKey.mood);
		const water = trackers.at(0)?.id ?? anId<'Tracker'>();
		await app.logEntry.execute({ trackerId: water, values: values(['glasses', number(6)]) });

		const charts = await app.listStats.execute({ weekStart });

		expect(charts.map((chart) => chart.tracker.id)).toEqual(trackers.map((tracker) => tracker.id));
		expect(charts.at(0)?.values.at(-1)).toBe(6);
	});
});
