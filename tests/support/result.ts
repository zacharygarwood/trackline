import type { Result } from '../../src/lib/shared/result.ts';

/**
 * Returns the success value of a result, failing the test if it is an error.
 *
 * @param result - The result under test.
 * @returns The wrapped value.
 */
export function expectOk<T, E>(result: Result<T, E>): T {
	if (!result.ok) throw new Error(`Expected ok, got error: ${String(result.error)}`);
	return result.value;
}

/**
 * Returns the error of a result, failing the test if it succeeded.
 *
 * @param result - The result under test.
 * @returns The wrapped error.
 */
export function expectErr<T, E>(result: Result<T, E>): E {
	if (result.ok) throw new Error(`Expected error, got ok: ${String(result.value)}`);
	return result.error;
}
