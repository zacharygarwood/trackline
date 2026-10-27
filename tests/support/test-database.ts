import type { SqlRow, SqlStatement } from '../../src/lib/platform/db/sql.ts';
import type { SqlDriver } from '../../src/lib/platform/db/sql-driver.ts';
import { executeRequest, type SqlExecutor } from '../../src/lib/platform/db/sql-executor.ts';
import type { SqlRequest } from '../../src/lib/platform/db/sql-protocol.ts';
import { SqlRequestKind } from '../../src/lib/platform/db/sql-request.constants.ts';
import { NodeSqliteExecutor } from './node-sqlite-executor.ts';

/**
 * A {@link SqlDriver} that runs requests directly on an in-memory `node:sqlite`
 * database, through the same request handling as the worker.
 */
export class TestDatabase implements SqlDriver {
	constructor(private readonly executor: SqlExecutor = new NodeSqliteExecutor()) {}

	query(statement: SqlStatement): Promise<readonly SqlRow[]> {
		return this.send({ kind: SqlRequestKind.query, statement });
	}

	async execute(statement: SqlStatement): Promise<void> {
		await this.send({ kind: SqlRequestKind.execute, statement });
	}

	async transaction(statements: readonly SqlStatement[]): Promise<void> {
		await this.send({ kind: SqlRequestKind.transaction, statements });
	}

	private send(request: SqlRequest): Promise<readonly SqlRow[]> {
		const response = executeRequest(this.executor, request);
		return response.ok
			? Promise.resolve(response.rows)
			: Promise.reject(new Error(response.message));
	}
}
