import { describe, expect, it } from 'vitest';
import { TestDatabase } from '../../../../tests/support/test-database.ts';
import { bundledMigrations } from './bundled-migrations.ts';
import { migrate } from './migrate.ts';

const tableNames = async (database: TestDatabase) =>
	(
		await database.query({
			name: 'list tables',
			sql: "SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name",
			params: []
		})
	).map((row) => row.name);

describe('migrate', () => {
	it('applies every migration to an empty database', async () => {
		const database = new TestDatabase();

		const outcome = await migrate(database, [
			{ version: 1, sql: 'CREATE TABLE a (id TEXT) STRICT' },
			{ version: 2, sql: 'CREATE TABLE b (id TEXT) STRICT' }
		]);

		expect(outcome).toEqual({ fromVersion: 0, toVersion: 2 });
		expect(await tableNames(database)).toEqual(['a', 'b']);
	});

	it('applies only migrations newer than the schema version', async () => {
		const database = new TestDatabase();
		await migrate(database, [{ version: 1, sql: 'CREATE TABLE a (id TEXT) STRICT' }]);

		const outcome = await migrate(database, [
			{ version: 1, sql: 'CREATE TABLE a (id TEXT) STRICT' },
			{ version: 2, sql: 'CREATE TABLE b (id TEXT) STRICT' }
		]);

		expect(outcome).toEqual({ fromVersion: 1, toVersion: 2 });
		expect(await tableNames(database)).toEqual(['a', 'b']);
	});

	it('does nothing when the schema is current', async () => {
		const database = new TestDatabase();
		const migrations = [{ version: 1, sql: 'CREATE TABLE a (id TEXT) STRICT' }];
		await migrate(database, migrations);

		expect(await migrate(database, migrations)).toEqual({ fromVersion: 1, toVersion: 1 });
	});

	it('applies nothing when any pending migration fails', async () => {
		const database = new TestDatabase();

		await expect(
			migrate(database, [
				{ version: 1, sql: 'CREATE TABLE a (id TEXT) STRICT' },
				{ version: 2, sql: 'CREATE TABLE broken (' }
			])
		).rejects.toThrow('migration 2');

		expect(await tableNames(database)).toEqual([]);
		expect(await migrate(database, [])).toEqual({ fromVersion: 0, toVersion: 0 });
	});
});

describe('schema', () => {
	it('matches the committed snapshot after all migrations', async () => {
		const database = new TestDatabase();
		await migrate(database, bundledMigrations);

		const schema = await database.query({
			name: 'read schema',
			sql: "SELECT sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type, name",
			params: []
		});

		await expect(
			schema.map((row) => `${String(row.sql)};`).join('\n\n') + '\n'
		).toMatchFileSnapshot('./schema.snapshot.sql');
	});
});
