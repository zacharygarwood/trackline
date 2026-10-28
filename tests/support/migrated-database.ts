import { bundledMigrations } from '../../src/lib/platform/db/bundled-migrations.ts';
import { migrate } from '../../src/lib/platform/db/migrate.ts';
import { TestDatabase } from './test-database.ts';

/** A fresh in-memory database with every migration applied. */
export async function migratedDatabase(): Promise<TestDatabase> {
	const database = new TestDatabase();
	await migrate(database, bundledMigrations);
	return database;
}
