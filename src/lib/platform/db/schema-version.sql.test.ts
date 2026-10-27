import { describe, expect, it } from 'vitest';
import { writeSchemaVersion } from './schema-version.sql.ts';

describe('writeSchemaVersion', () => {
	it('inlines a valid version', () => {
		expect(writeSchemaVersion(3).sql).toBe('PRAGMA user_version = 3');
	});

	it.each([-1, 1.5, Number.NaN])('rejects %d', (version) => {
		expect(() => writeSchemaVersion(version)).toThrow('Invalid schema version');
	});
});
