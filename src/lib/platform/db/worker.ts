import sqlite3InitModule, { type Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import { DATABASE_FILE, ENABLE_FOREIGN_KEYS } from './database.constants.ts';
import { executeRequest, type SqlExecutor } from './sql-executor.ts';
import {
	isSqlRequestMessage,
	isSqlWorkerSetup,
	type SqlResponseMessage,
	type SqlWorkerSetup
} from './sql-protocol.ts';
import { WasmSqlExecutor } from './wasm-sql-executor.ts';

/**
 * SQLite's Emscripten loader accepts a `locateFile` option that its type
 * declarations omit. Pointing it at the main bundle's copy of the WASM file
 * lets the service worker precache it, so the database opens offline.
 */
const initSqlite: (options: { locateFile: () => string }) => Promise<Sqlite3Static> =
	sqlite3InitModule;

/**
 * Opens the database in the Origin Private File System through the
 * `opfs-sahpool` VFS, which needs no cross-origin isolation headers.
 */
async function openExecutor(setup: SqlWorkerSetup): Promise<SqlExecutor> {
	const sqlite3 = await initSqlite({ locateFile: () => setup.wasmUrl });
	const pool = await sqlite3.installOpfsSAHPoolVfs({});
	const database = new pool.OpfsSAHPoolDb(DATABASE_FILE);
	database.exec(ENABLE_FOREIGN_KEYS);
	return new WasmSqlExecutor(database);
}

const executor = new Promise<SqlExecutor>((resolve, reject) => {
	self.addEventListener('message', function setUp(event: MessageEvent<unknown>) {
		if (!isSqlWorkerSetup(event.data)) return;
		self.removeEventListener('message', setUp);
		openExecutor(event.data).then(resolve, reject);
	});
});

self.addEventListener('message', (event: MessageEvent<unknown>) => {
	void respond(event.data);
});

async function respond(data: unknown): Promise<void> {
	if (!isSqlRequestMessage(data)) return;
	const message: SqlResponseMessage = {
		id: data.id,
		response: await executor.then(
			(ready) => executeRequest(ready, data.request),
			(error: unknown) => ({ ok: false, message: String(error) })
		)
	};
	self.postMessage(message);
}
