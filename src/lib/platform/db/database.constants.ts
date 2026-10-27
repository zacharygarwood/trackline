/** Where the database lives inside the OPFS SAH pool. */
export const DATABASE_FILE = '/buffalog.sqlite3';

/** SQLite WASM `exec` options that return result rows as objects keyed by column. */
export const OBJECT_ROWS = { rowMode: 'object', returnValue: 'resultRows' } as const;

/** Turns on foreign key enforcement; SQLite leaves it off by default on every connection. */
export const ENABLE_FOREIGN_KEYS = 'PRAGMA foreign_keys = ON';
