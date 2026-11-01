import type { Clock } from '../../shared/clock.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { SessionId, TrackerId } from '../domain/ids.ts';
import {
	finishSession,
	startSession,
	type ActiveSession,
	type FinishedSession,
	type Session,
	type SessionsNotUsed
} from '../domain/session.ts';
import type {
	EntryReader,
	SessionReader,
	SessionWriter,
	TrackerReader
} from '../domain/tracking-repositories.ts';
import { SessionState } from '../domain/tracking.constants.ts';
import { SessionNotFound, TrackerNotFound } from './tracking-errors.ts';

/** Names one tracker. */
export interface SessionTrackerCommand {
	readonly trackerId: TrackerId;
}

/** Names one session. */
export interface SessionCommand {
	readonly id: SessionId;
}

/** What starting a session needs. */
export interface StartSessionPorts {
	readonly trackers: TrackerReader;
	readonly sessions: SessionReader & SessionWriter;
	readonly clock: Clock;
	readonly ids: IdGenerator;
}

function activeOf(sessions: readonly Session[]): ActiveSession | undefined {
	return sessions.find(
		(session): session is ActiveSession => session.state === SessionState.active
	);
}

/** Starts a workout or other session today, or returns the one already under way. */
export class StartSession {
	constructor(private readonly ports: StartSessionPorts) {}

	/** @param command - The tracker. */
	async execute(
		command: SessionTrackerCommand
	): Promise<Result<ActiveSession, TrackerNotFound | SessionsNotUsed>> {
		const { trackers, sessions, clock, ids } = this.ports;
		const tracker = await trackers.findById(command.trackerId);
		if (tracker === undefined) return err(new TrackerNotFound(command.trackerId));
		const active = activeOf(await sessions.findFor(tracker.id));
		if (active !== undefined) return ok(active);
		const started = startSession({
			id: ids.next<'Session'>(),
			trackerId: tracker.id,
			kind: tracker.kind,
			date: clock.today(),
			now: clock.now()
		});
		if (started.ok) await sessions.save(started.value);
		return started;
	}
}

/** What finishing a session needs. */
export interface FinishSessionPorts {
	readonly sessions: SessionReader & SessionWriter;
	readonly entries: EntryReader;
	readonly clock: Clock;
}

/** Finishes the session under way. One with nothing logged is discarded instead. */
export class FinishSession {
	constructor(private readonly ports: FinishSessionPorts) {}

	/**
	 * @param command - The session.
	 * @returns The finished session, or undefined when it was empty and discarded.
	 */
	async execute(
		command: SessionCommand
	): Promise<Result<FinishedSession | undefined, SessionNotFound>> {
		const { sessions, entries, clock } = this.ports;
		const session = await sessions.findById(command.id);
		if (session?.state !== SessionState.active) return err(new SessionNotFound(command.id));
		const logged = await entries.findFor(session.trackerId);
		if (!logged.some((entry) => entry.sessionId === session.id)) {
			await sessions.delete(session.id);
			return ok(undefined);
		}
		const finished = finishSession(session, clock.now());
		await sessions.save(finished);
		return ok(finished);
	}
}

/** Throws away a session and everything logged in it. */
export class DiscardSession {
	constructor(private readonly sessions: SessionWriter) {}

	/** @param command - The session. */
	async execute(command: SessionCommand): Promise<void> {
		await this.sessions.delete(command.id);
	}
}

/** A tracker's sessions: the one under way, if any, and the finished ones, newest first. */
export interface TrackerSessions {
	readonly active: ActiveSession | undefined;
	readonly finished: readonly FinishedSession[];
}

/** Lists a tracker's sessions. */
export class ListSessions {
	constructor(private readonly sessions: SessionReader) {}

	/** @param command - The tracker. */
	async execute(command: SessionTrackerCommand): Promise<TrackerSessions> {
		const all = await this.sessions.findFor(command.trackerId);
		return {
			active: activeOf(all),
			finished: all.filter(
				(session): session is FinishedSession => session.state === SessionState.finished
			)
		};
	}
}

/** Reads one session, for its page. */
export class GetSession {
	constructor(private readonly sessions: SessionReader) {}

	/** @param command - The session. */
	execute(command: SessionCommand): Promise<Session | undefined> {
		return this.sessions.findById(command.id);
	}
}
