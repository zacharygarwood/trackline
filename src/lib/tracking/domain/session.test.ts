import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aTrackerId } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { finishSession, SessionsNotUsed, startSession, type StartSession } from './session.ts';
import { SessionState, TrackerKind } from './tracking.constants.ts';

const command: StartSession = {
	id: anId<'Session'>(),
	trackerId: aTrackerId(),
	kind: TrackerKind.workout,
	date: expectOk(LocalDate.parse('2026-10-29')),
	now: 5000
};

describe('startSession', () => {
	it('starts a workout under way', () => {
		expect(expectOk(startSession(command))).toMatchObject({
			state: SessionState.active,
			startedAt: 5000
		});
	});

	it('is only for trackers that group entries into sessions', () => {
		expect(expectErr(startSession({ ...command, kind: TrackerKind.log }))).toBeInstanceOf(
			SessionsNotUsed
		);
	});
});

describe('finishSession', () => {
	const started = expectOk(startSession(command));

	it('finishes now', () => {
		expect(finishSession(started, 9000)).toMatchObject({
			state: SessionState.finished,
			finishedAt: 9000
		});
	});

	it('never finishes before it started', () => {
		expect(finishSession(started, 1000).finishedAt).toBe(5000);
	});
});
