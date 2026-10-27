import { first, last } from '../../shared/collections.ts';
import type { SqlDriver } from './sql-driver.ts';
import { READ_SCHEMA_VERSION, writeSchemaVersion } from './schema-version.sql.ts';

/** One numbered schema change. */
export interface Migration {
	/** The number from the file name; migrations apply in ascending order. */
	readonly version: number;
	readonly sql: string;
}

/** The schema versions before and after migrating. Version 0 is an empty database. */
export interface MigrationOutcome {
	readonly fromVersion: number;
	readonly toVersion: number;
}

/**
 * Applies every migration newer than the database's schema version, in one transaction.
 *
 * @param driver - The database to migrate.
 * @param migrations - All known migrations, in any order.
 * @throws If the stored schema version can't be read or a migration fails; nothing is applied.
 */
export async function migrate(
	driver: SqlDriver,
	migrations: readonly Migration[]
): Promise<MigrationOutcome> {
	const fromVersion = await readSchemaVersion(driver);
	const pending = migrations
		.filter((migration) => migration.version > fromVersion)
		.toSorted((a, b) => a.version - b.version);
	const toVersion = last(pending)?.version ?? fromVersion;
	if (pending.length > 0) {
		await driver.transaction([
			...pending.map((migration) => ({
				name: `migration ${String(migration.version)}`,
				sql: migration.sql,
				params: []
			})),
			writeSchemaVersion(toVersion)
		]);
	}
	return { fromVersion, toVersion };
}

async function readSchemaVersion(driver: SqlDriver): Promise<number> {
	const version = first(await driver.query(READ_SCHEMA_VERSION))?.user_version;
	if (typeof version !== 'number') throw new Error('Could not read the schema version');
	return version;
}
