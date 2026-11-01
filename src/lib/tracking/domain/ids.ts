import type { Id } from '../../shared/id.ts';

/** Identifies one tracker. */
export type TrackerId = Id<'Tracker'>;

/** Identifies one thing in a tracker's library, such as an exercise, a food, or a plant. */
export type SubjectId = Id<'Subject'>;

/** Identifies one logged entry. */
export type EntryId = Id<'Entry'>;

/** Identifies one session, such as a workout. */
export type SessionId = Id<'Session'>;
