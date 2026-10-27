import sqliteWasmUrl from '@sqlite.org/sqlite-wasm/sqlite3.wasm?url';
import type { SqlDriver } from './sql-driver.ts';
import type { SqlWorkerSetup } from './sql-protocol.ts';
import { WorkerSqlDriver } from './worker-sql-driver.ts';

/** Starts the database worker and returns a driver connected to it. */
export function openDatabase(): SqlDriver {
	const worker = new Worker(new URL('./worker.ts', import.meta.url), {
		type: 'module',
		name: 'database'
	});
	const setup: SqlWorkerSetup = { wasmUrl: sqliteWasmUrl };
	worker.postMessage(setup);
	return new WorkerSqlDriver(worker);
}
