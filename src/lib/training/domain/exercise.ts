import type { Result } from '../../shared/result.ts';
import type { ExerciseId } from './ids.ts';
import { parseName, type InvalidName } from './name.ts';

/** A movement in the user's exercise library, such as "Bench press". Names are unique, ignoring case. */
export interface Exercise {
	readonly id: ExerciseId;
	readonly name: string;
}

/**
 * Creates an exercise with a valid name.
 *
 * @param fields - The exercise's id and the name as typed.
 */
export function createExercise(fields: Exercise): Result<Exercise, InvalidName> {
	const name = parseName(fields.name);
	return name.ok ? { ok: true, value: { id: fields.id, name: name.value } } : name;
}
