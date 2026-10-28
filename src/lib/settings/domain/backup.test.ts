import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import {
	BackupFromNewerVersion,
	checkRestorable,
	isBackupOverdue,
	UnreadableBackup
} from './backup.ts';

const DAY = 86_400_000;
const manifest = { formatVersion: 1, appVersion: '1.0.0', schemaVersion: 2, createdAt: 0 };

describe('checkRestorable', () => {
	it('accepts a backup from this or an older schema', () => {
		expect(expectOk(checkRestorable(manifest, 2))).toBe(manifest);
		expect(expectOk(checkRestorable(manifest, 3))).toBe(manifest);
	});

	it('rejects a backup from a newer schema', () => {
		const problem = expectErr(checkRestorable(manifest, 1));

		expect(problem).toEqual(new BackupFromNewerVersion(2, 1));
	});

	it('rejects a newer file layout', () => {
		expect(expectErr(checkRestorable({ ...manifest, formatVersion: 2 }, 2))).toBeInstanceOf(
			UnreadableBackup
		);
	});
});

describe('isBackupOverdue', () => {
	it('is overdue when the user has never exported', () => {
		expect(isBackupOverdue(undefined, 0)).toBe(true);
	});

	it('is not overdue within 30 days of the last export', () => {
		expect(isBackupOverdue(0, 30 * DAY)).toBe(false);
	});

	it('is overdue after 30 days', () => {
		expect(isBackupOverdue(0, 30 * DAY + 1)).toBe(true);
	});
});
