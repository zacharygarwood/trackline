import type { SqlRow, SqlStatement } from './sql.ts';
import type { SqlRequest, SqlResponse } from './sql-protocol.ts';
import { SqlRequestKind } from './sql-request.constants.ts';
import { BEGIN_TRANSACTION, COMMIT_TRANSACTION, ROLLBACK_TRANSACTION } from './transaction.sql.ts';

/** A synchronous SQLite engine: SQLite WASM in the worker, or `node:sqlite` in tests. */
export interface SqlExecutor {
	/** Runs a statement and returns its rows. */
	rows(statement: SqlStatement): readonly SqlRow[];
	/** Runs a statement, or a parameterless script of several statements, for its effect. */
	run(statement: SqlStatement): void;
}

/**
 * Handles one request against an engine, turning any failure into an error response.
 *
 * @param executor - The engine to run the request on.
 * @param request - What to run.
 */
export function executeRequest(executor: SqlExecutor, request: SqlRequest): SqlResponse {
	try {
		return { ok: true, rows: perform(executor, request) };
	} catch (error) {
		return { ok: false, message: error instanceof Error ? error.message : String(error) };
	}
}

function perform(executor: SqlExecutor, request: SqlRequest): readonly SqlRow[] {
	switch (request.kind) {
		case SqlRequestKind.query:
			return executor.rows(request.statement);
		case SqlRequestKind.execute:
			executor.run(request.statement);
			return [];
		case SqlRequestKind.transaction:
			runInTransaction(executor, request.statements);
			return [];
	}
}

function runInTransaction(executor: SqlExecutor, statements: readonly SqlStatement[]): void {
	executor.run(BEGIN_TRANSACTION);
	try {
		statements.forEach((statement) => {
			runNamed(executor, statement);
		});
		executor.run(COMMIT_TRANSACTION);
	} catch (error) {
		executor.run(ROLLBACK_TRANSACTION);
		throw error;
	}
}

function runNamed(executor: SqlExecutor, statement: SqlStatement): void {
	try {
		executor.run(statement);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		throw new Error(`${statement.name}: ${reason}`, { cause: error });
	}
}
