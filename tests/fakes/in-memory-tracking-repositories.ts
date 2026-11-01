import type { LocalDate } from '../../src/lib/shared/local-date.ts';
import type { Entry } from '../../src/lib/tracking/domain/entry.ts';
import { byDay } from '../../src/lib/tracking/domain/goal.ts';
import type {
	EntryId,
	SessionId,
	SubjectId,
	TrackerId
} from '../../src/lib/tracking/domain/ids.ts';
import type { Session } from '../../src/lib/tracking/domain/session.ts';
import type { Subject } from '../../src/lib/tracking/domain/subject.ts';
import type { Tracker } from '../../src/lib/tracking/domain/tracker.ts';
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

/** The rows every in-memory tracking repository shares, so deletes cascade as in SQLite. */
class Tables {
	readonly trackers = new Map<TrackerId, Tracker>();
	readonly subjects = new Map<SubjectId, Subject>();
	readonly sessions = new Map<SessionId, Session>();
	readonly entries = new Map<EntryId, Entry>();
}

/** In-memory trackers for tests. */
export class InMemoryTrackers implements TrackerReader, TrackerWriter {
	constructor(private readonly tables: Tables) {}

	findAll(): Promise<readonly Tracker[]> {
		return Promise.resolve(
			[...this.tables.trackers.values()].sort((one, other) =>
				one.position === other.position
					? one.id.localeCompare(other.id)
					: one.position - other.position
			)
		);
	}

	findById(id: TrackerId): Promise<Tracker | undefined> {
		return Promise.resolve(this.tables.trackers.get(id));
	}

	save(trackers: readonly Tracker[]): Promise<void> {
		for (const tracker of trackers) this.tables.trackers.set(tracker.id, tracker);
		return Promise.resolve();
	}

	delete(id: TrackerId): Promise<void> {
		this.tables.trackers.delete(id);
		const { subjects, sessions, entries } = this.tables;
		for (const [key, row] of subjects) if (row.trackerId === id) subjects.delete(key);
		for (const [key, row] of sessions) if (row.trackerId === id) sessions.delete(key);
		for (const [key, row] of entries) if (row.trackerId === id) entries.delete(key);
		return Promise.resolve();
	}
}

/** In-memory libraries for tests. */
export class InMemorySubjects implements SubjectReader, SubjectWriter {
	constructor(private readonly tables: Tables) {}

	findFor(trackerId: TrackerId): Promise<readonly Subject[]> {
		return Promise.resolve(
			[...this.tables.subjects.values()]
				.filter((subject) => subject.trackerId === trackerId)
				.sort((one, other) => one.name.toLowerCase().localeCompare(other.name.toLowerCase()))
		);
	}

	findById(id: SubjectId): Promise<Subject | undefined> {
		return Promise.resolve(this.tables.subjects.get(id));
	}

	save(subjects: readonly Subject[]): Promise<void> {
		for (const subject of subjects) this.tables.subjects.set(subject.id, subject);
		return Promise.resolve();
	}
}

/** In-memory sessions for tests. */
export class InMemorySessions implements SessionReader, SessionWriter {
	constructor(private readonly tables: Tables) {}

	findFor(trackerId: TrackerId): Promise<readonly Session[]> {
		return Promise.resolve(
			[...this.tables.sessions.values()]
				.filter((session) => session.trackerId === trackerId)
				.sort((one, other) =>
					one.startedAt === other.startedAt
						? other.id.localeCompare(one.id)
						: other.startedAt - one.startedAt
				)
		);
	}

	findById(id: SessionId): Promise<Session | undefined> {
		return Promise.resolve(this.tables.sessions.get(id));
	}

	save(session: Session): Promise<void> {
		this.tables.sessions.set(session.id, session);
		return Promise.resolve();
	}

	delete(id: SessionId): Promise<void> {
		this.tables.sessions.delete(id);
		for (const [key, entry] of this.tables.entries)
			if (entry.sessionId === id) this.tables.entries.delete(key);
		return Promise.resolve();
	}
}

/** In-memory entries for tests. */
export class InMemoryEntries implements EntryReader, EntryWriter {
	constructor(private readonly tables: Tables) {}

	private ordered(): Entry[] {
		return [...this.tables.entries.values()].sort((one, other) => {
			const order = byDay(one, other);
			return order === 0 ? one.id.localeCompare(other.id) : order;
		});
	}

	findSince(date: LocalDate): Promise<readonly Entry[]> {
		return Promise.resolve(this.ordered().filter((entry) => !entry.date.isBefore(date)));
	}

	findFor(trackerId: TrackerId): Promise<readonly Entry[]> {
		return Promise.resolve(this.ordered().filter((entry) => entry.trackerId === trackerId));
	}

	findById(id: EntryId): Promise<Entry | undefined> {
		return Promise.resolve(this.tables.entries.get(id));
	}

	save(entry: Entry): Promise<void> {
		this.tables.entries.set(entry.id, entry);
		return Promise.resolve();
	}

	delete(id: EntryId): Promise<void> {
		this.tables.entries.delete(id);
		return Promise.resolve();
	}
}

/** Every in-memory tracking repository, sharing one set of tables. */
export function inMemoryTracking() {
	const tables = new Tables();
	return {
		trackers: new InMemoryTrackers(tables),
		subjects: new InMemorySubjects(tables),
		sessions: new InMemorySessions(tables),
		entries: new InMemoryEntries(tables)
	};
}
