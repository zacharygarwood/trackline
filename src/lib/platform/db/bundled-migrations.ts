import type { Migration } from './migrate.ts';

const MIGRATION_FILE = /\/(\d{4})_[\da-z_]+\.sql$/;

/**
 * Turns migration files into ordered migrations.
 *
 * @param files - SQL text keyed by path, each named like `0001_init.sql`.
 * @throws If a file name doesn't follow the pattern or two files share a number.
 */
export function parseMigrations(files: Readonly<Record<string, string>>): readonly Migration[] {
	const migrations = Object.entries(files)
		.map(([path, sql]) => ({ version: versionOf(path), sql }))
		.toSorted((a, b) => a.version - b.version);
	const versions = new Set(migrations.map((migration) => migration.version));
	if (versions.size !== migrations.length) throw new Error('Two migrations share a number');
	return migrations;
}

function versionOf(path: string): number {
	const number = MIGRATION_FILE.exec(path)?.at(1);
	if (number === undefined) throw new Error(`Migration file name is invalid: ${path}`);
	return Number(number);
}

/** Every migration in `migrations/`, bundled into the app at build time. */
export const bundledMigrations: readonly Migration[] = parseMigrations(
	import.meta.glob<string>('./migrations/*.sql', { query: '?raw', import: 'default', eager: true })
);
