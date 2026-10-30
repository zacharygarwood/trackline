import type { Exercise } from '../domain/exercise.ts';

/** How many recent exercises show before anything is typed. */
export const RECENT_EXERCISES = 5;

/**
 * The exercises to offer for a search: matches by name, A to Z, or the
 * five most recent when nothing is typed.
 *
 * @param query - What the user typed.
 * @param recent - The library, most recently used first.
 */
export function matchExercises(query: string, recent: readonly Exercise[]): readonly Exercise[] {
	const typed = query.trim().toLowerCase();
	if (typed === '') return recent.slice(0, RECENT_EXERCISES);
	return recent
		.filter((exercise) => exercise.name.toLowerCase().includes(typed))
		.toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * Whether a search could become a new exercise: something is typed and no
 * exercise has that exact name, ignoring case.
 *
 * @param query - What the user typed.
 * @param library - Every exercise.
 */
export function canCreateExercise(query: string, library: readonly Exercise[]): boolean {
	const typed = query.trim().toLowerCase();
	return typed !== '' && !library.some((exercise) => exercise.name.toLowerCase() === typed);
}

/**
 * A typed name with its first letter capitalized, as new exercises and foods are saved.
 *
 * @param text - What the user typed.
 */
export function capitalized(text: string): string {
	const trimmed = text.trim();
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
