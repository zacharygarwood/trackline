import type { SqlRow, SqlStatement } from './sql.ts';
import { SqlRequestKind } from './sql-request.constants.ts';

/** A request the database worker can handle. */
export type SqlRequest =
	| { readonly kind: typeof SqlRequestKind.query; readonly statement: SqlStatement }
	| { readonly kind: typeof SqlRequestKind.execute; readonly statement: SqlStatement }
	| {
			readonly kind: typeof SqlRequestKind.transaction;
			readonly statements: readonly SqlStatement[];
	  };

/** The worker's answer: rows on success, an error message on failure. */
export type SqlResponse =
	| { readonly ok: true; readonly rows: readonly SqlRow[] }
	| { readonly ok: false; readonly message: string };

/** A request tagged with an id so its response can be matched to it. */
export interface SqlRequestMessage {
	readonly id: number;
	readonly request: SqlRequest;
}

/** A response tagged with the id of the request it answers. */
export interface SqlResponseMessage {
	readonly id: number;
	readonly response: SqlResponse;
}

/** The first message the worker receives: where to load the SQLite WASM binary from. */
export interface SqlWorkerSetup {
	readonly wasmUrl: string;
}

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
	typeof value === 'object' && value !== null;

function isStatement(value: unknown): value is SqlStatement {
	return (
		isRecord(value) &&
		typeof value.name === 'string' &&
		typeof value.sql === 'string' &&
		Array.isArray(value.params)
	);
}

function isRequest(value: unknown): value is SqlRequest {
	if (!isRecord(value)) return false;
	switch (value.kind) {
		case SqlRequestKind.query:
		case SqlRequestKind.execute:
			return isStatement(value.statement);
		case SqlRequestKind.transaction:
			return Array.isArray(value.statements) && value.statements.every(isStatement);
		default:
			return false;
	}
}

/**
 * Whether a message received by the worker is a well-formed request.
 *
 * @param value - The `data` of a received message event.
 */
export function isSqlRequestMessage(value: unknown): value is SqlRequestMessage {
	return isRecord(value) && typeof value.id === 'number' && isRequest(value.request);
}

/**
 * Whether a message received from the worker is a well-formed response.
 *
 * @param value - The `data` of a received message event.
 */
export function isSqlResponseMessage(value: unknown): value is SqlResponseMessage {
	if (!isRecord(value) || typeof value.id !== 'number') return false;
	const response = value.response;
	return (
		isRecord(response) &&
		((response.ok === true && Array.isArray(response.rows)) ||
			(response.ok === false && typeof response.message === 'string'))
	);
}

/**
 * Whether a message received by the worker is its setup message.
 *
 * @param value - The `data` of a received message event.
 */
export function isSqlWorkerSetup(value: unknown): value is SqlWorkerSetup {
	return isRecord(value) && typeof value.wasmUrl === 'string';
}
