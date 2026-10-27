/** A successful outcome carrying its value. */
export interface Ok<T> {
	readonly ok: true;
	readonly value: T;
}

/** An expected failure carrying a typed error. */
export interface Err<E> {
	readonly ok: false;
	readonly error: E;
}

/**
 * The outcome of an operation that can fail in an expected way.
 *
 * Factories and use cases return a `Result` instead of throwing, so callers
 * must handle the failure case to reach the value.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Wraps a success value.
 *
 * @param value - The value produced by the operation.
 */
export function ok<T>(value: T): Ok<T> {
	return { ok: true, value };
}

/**
 * Wraps an expected failure.
 *
 * @param error - A specific, named error describing what went wrong.
 */
export function err<E>(error: E): Err<E> {
	return { ok: false, error };
}
