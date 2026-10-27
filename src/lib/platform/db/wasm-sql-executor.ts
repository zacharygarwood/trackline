import type { Database } from '@sqlite.org/sqlite-wasm';
import { toSqlRow, type SqlRow, type SqlStatement } from './sql.ts';
import type { SqlExecutor } from './sql-executor.ts';
import { OBJECT_ROWS } from './database.constants.ts';

/** A {@link SqlExecutor} on a SQLite WASM database, used inside the database worker. */
export class WasmSqlExecutor implements SqlExecutor {
	/** @param database - An open SQLite WASM database. */
	constructor(private readonly database: Database) {}

	/** {@inheritDoc SqlExecutor.rows} */
	rows(statement: SqlStatement): readonly SqlRow[] {
		return this.database
			.exec({ sql: statement.sql, bind: [...statement.params], ...OBJECT_ROWS })
			.map(toSqlRow);
	}

	/** {@inheritDoc SqlExecutor.run} */
	run(statement: SqlStatement): void {
		if (statement.params.length === 0) {
			this.database.exec(statement.sql);
		} else {
			this.database.exec({ sql: statement.sql, bind: [...statement.params] });
		}
	}
}
