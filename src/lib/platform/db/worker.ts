import sqlite3InitModule, {
	type OpfsSAHPoolDatabase,
	type SAHPoolUtil,
	type Sqlite3Static
} from '@sqlite.org/sqlite-wasm';
import { DATABASE_FILE, ENABLE_FOREIGN_KEYS } from './database.constants.ts';
import { executeRequest } from './sql-executor.ts';
import {
	isSqlRequestMessage,
	isSqlWorkerSetup,
	type SqlResponse,
	type SqlResponseMessage,
	type SqlWorkerSetup,
	type WorkerRequest
} from './sql-protocol.ts';
import { SqlRequestKind } from './sql-request.constants.ts';
import { WasmSqlExecutor } from './wasm-sql-executor.ts';

/**
 * SQLite's Emscripten loader accepts a `locateFile` option that its type
 * declarations omit. Pointing it at the main bundle's copy of the WASM file
 * lets the service worker precache it, so the database opens offline.
 */
const initSqlite: (options: { locateFile: () => string }) => Promise<Sqlite3Static> =
	sqlite3InitModule;

/** The open database file in the OPFS SAH pool, which can also be exported, replaced, or wiped. */
class PooledDatabase {
	private database: OpfsSAHPoolDatabase;

	constructor(private readonly pool: SAHPoolUtil) {
		this.database = this.open();
	}

	async handle(request: WorkerRequest): Promise<SqlResponse> {
		switch (request.kind) {
			case SqlRequestKind.exportFile:
				return { ok: true, rows: [{ file: this.pool.exportFile(DATABASE_FILE) }] };
			case SqlRequestKind.replaceFile:
				return this.reopenAfter(() => this.pool.importDb(DATABASE_FILE, request.file));
			case SqlRequestKind.wipe:
				return this.reopenAfter(() => this.pool.wipeFiles());
			case SqlRequestKind.query:
			case SqlRequestKind.execute:
			case SqlRequestKind.transaction:
				return executeRequest(new WasmSqlExecutor(this.database), request);
		}
	}

	private open(): OpfsSAHPoolDatabase {
		const database = new this.pool.OpfsSAHPoolDb(DATABASE_FILE);
		database.exec(ENABLE_FOREIGN_KEYS);
		return database;
	}

	private async reopenAfter(change: () => Promise<unknown>): Promise<SqlResponse> {
		this.database.close();
		try {
			await change();
			return { ok: true, rows: [] };
		} finally {
			this.database = this.open();
		}
	}
}

/**
 * Opens the database in the Origin Private File System through the
 * `opfs-sahpool` VFS, which needs no cross-origin isolation headers.
 */
async function openDatabase(setup: SqlWorkerSetup): Promise<PooledDatabase> {
	const sqlite3 = await initSqlite({ locateFile: () => setup.wasmUrl });
	return new PooledDatabase(await sqlite3.installOpfsSAHPoolVfs({}));
}

const database = new Promise<PooledDatabase>((resolve, reject) => {
	self.addEventListener('message', function setUp(event: MessageEvent<unknown>) {
		if (!isSqlWorkerSetup(event.data)) return;
		self.removeEventListener('message', setUp);
		openDatabase(event.data).then(resolve, reject);
	});
});

let queue: Promise<unknown> = Promise.resolve();

self.addEventListener('message', (event: MessageEvent<unknown>) => {
	const data = event.data;
	if (!isSqlRequestMessage(data)) return;
	queue = queue.then(() => respond(data.id, data.request));
});

/** Answers one request; requests run strictly in order because file changes are asynchronous. */
async function respond(id: number, request: WorkerRequest): Promise<void> {
	const response = await database.then(
		(ready) => ready.handle(request),
		(error: unknown): SqlResponse => ({ ok: false, message: String(error) })
	);
	const message: SqlResponseMessage = { id, response };
	self.postMessage(message);
}
