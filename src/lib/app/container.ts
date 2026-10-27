import { bundledMigrations } from '../platform/db/bundled-migrations.ts';
import { migrate } from '../platform/db/migrate.ts';
import { openDatabase } from '../platform/db/open-database.ts';
import { requestPersistentStorage } from '../platform/pwa/persistent-storage.ts';

/**
 * Starts the app's infrastructure: opens the on-device database, brings its
 * schema up to date, and then asks the browser to keep the data.
 *
 * This is the composition root, the only module that wires infrastructure
 * implementations together.
 *
 * @throws If the database can't be opened or migrated.
 */
export async function startApp(): Promise<void> {
	await migrate(openDatabase(), bundledMigrations);
	await requestPersistentStorage(navigator.storage);
}
