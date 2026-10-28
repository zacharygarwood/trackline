import { err, ok, type Result } from '../../shared/result.ts';

/** The longest name an exercise or template can have. */
export const MAX_NAME_LENGTH = 60;

/** Raised when a name is empty or too long. */
export class InvalidName {
	/** @param name - The rejected name. */
	constructor(readonly name: string) {}
}

/**
 * Validates a name typed by the user, trimming surrounding spaces.
 *
 * @param text - The typed name.
 * @returns The trimmed name, 1–60 characters long.
 */
export function parseName(text: string): Result<string, InvalidName> {
	const name = text.trim().replace(/\s+/g, ' ');
	return name.length >= 1 && name.length <= MAX_NAME_LENGTH ? ok(name) : err(new InvalidName(text));
}
