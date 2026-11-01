import type { EntryId, SessionId, SubjectId, TrackerId } from '../domain/ids.ts';

/** Raised when a tracker no longer exists, such as after it was deleted on another page. */
export class TrackerNotFound {
	/** @param id - The missing tracker. */
	constructor(readonly id: TrackerId) {}
}

/** Raised when a thing is not in the tracker's library. */
export class SubjectNotFound {
	/** @param id - The missing thing. */
	constructor(readonly id: SubjectId) {}
}

/** Raised when a session is missing, finished, or belongs to another tracker. */
export class SessionNotFound {
	/** @param id - The session. */
	constructor(readonly id: SessionId) {}
}

/** Raised when an entry no longer exists. */
export class EntryNotFound {
	/** @param id - The missing entry. */
	constructor(readonly id: EntryId) {}
}
