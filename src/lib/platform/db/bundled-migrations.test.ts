import { describe, expect, it } from 'vitest';
import { bundledMigrations, parseMigrations } from './bundled-migrations.ts';

describe('parseMigrations', () => {
	it('orders migrations by the number in their file name', () => {
		const migrations = parseMigrations({
			'./migrations/0002_add_food.sql': 'B',
			'./migrations/0001_init.sql': 'A'
		});

		expect(migrations).toEqual([
			{ version: 1, sql: 'A' },
			{ version: 2, sql: 'B' }
		]);
	});

	it('rejects a file name without a four-digit number', () => {
		expect(() => parseMigrations({ './migrations/init.sql': '' })).toThrow('init.sql');
	});

	it('rejects two migrations with the same number', () => {
		expect(() =>
			parseMigrations({ './migrations/0001_a.sql': '', './migrations/0001_b.sql': '' })
		).toThrow('share a number');
	});
});

describe('bundledMigrations', () => {
	it('includes every migration file, numbered from 1 without gaps', () => {
		expect(bundledMigrations.map((migration) => migration.version)).toEqual(
			bundledMigrations.map((_, position) => position + 1)
		);
	});
});
