import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { SessionId, TrackerId } from './ids.ts';
import { KIND_RULES, SessionState, type TrackerKind } from './tracking.constants.ts';

interface SessionBase {
	readonly id: SessionId;
	readonly trackerId: TrackerId;
	/** The day it started on, which is the day it counts toward. */
	readonly date: LocalDate;
	/** When it started, in epoch milliseconds. */
	readonly startedAt: number;
}

/** A session under way, such as a workout in progress. */
export type ActiveSession = SessionBase & { readonly state: typeof SessionState.active };

/** A session that is done. */
export type FinishedSession = SessionBase & {
	readonly state: typeof SessionState.finished;
	/** When it ended, in epoch milliseconds, never before it started. */
	readonly finishedAt: number;
};

/** A group of entries done together, such as a workout. */
export type Session = ActiveSession | FinishedSession;

/** Raised when a tracker of this kind does not group entries into sessions. */
export class SessionsNotUsed {
	/** @param kind - The tracker's kind. */
	constructor(readonly kind: TrackerKind) {}
}

/** What starting a session takes. */
export interface StartSession {
	readonly id: SessionId;
	readonly trackerId: TrackerId;
	readonly kind: TrackerKind;
	readonly date: LocalDate;
	readonly now: number;
}

/**
 * Starts a session for a tracker whose kind groups entries into sessions.
 *
 * @param command - The session's id, tracker, day, and start time.
 */
export function startSession(command: StartSession): Result<ActiveSession, SessionsNotUsed> {
	if (!KIND_RULES[command.kind].sessions) return err(new SessionsNotUsed(command.kind));
	const { id, trackerId, date, now } = command;
	return ok({ state: SessionState.active, id, trackerId, date, startedAt: now });
}

/**
 * Finishes a session. A clock that went backwards finishes it when it started.
 *
 * @param session - The session under way.
 * @param now - The current time in epoch milliseconds.
 */
export function finishSession(session: ActiveSession, now: number): FinishedSession {
	return { ...session, state: SessionState.finished, finishedAt: Math.max(now, session.startedAt) };
}
