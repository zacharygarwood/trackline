import type { Result } from '../../shared/result.ts';
import type { ExerciseId } from './ids.ts';
import { parseName, type InvalidName } from './name.ts';
import { createTracking, type InvalidTracking, type Tracking } from './tracking.ts';

/** A movement or activity in the user's library, such as "Bench press" or "Run". Names are unique, ignoring case. */
export interface Exercise {
	readonly id: ExerciseId;
	readonly name: string;
	/** What each set or effort records. */
	readonly tracking: Tracking;
}

/**
 * Creates an exercise with a valid name and tracking.
 *
 * @param fields - The exercise's id, the name as typed, and what it tracks.
 */
export function createExercise(fields: Exercise): Result<Exercise, InvalidName | InvalidTracking> {
	const name = parseName(fields.name);
	if (!name.ok) return name;
	const tracking = createTracking(fields.tracking);
	return tracking.ok
		? { ok: true, value: { id: fields.id, name: name.value, tracking: tracking.value } }
		: tracking;
}
