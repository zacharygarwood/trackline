import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { UnreadableBackup } from '../domain/backup.ts';
import { ZipBackupCodec } from './zip-backup-codec.ts';

const codec = new ZipBackupCodec();
const backup = {
	manifest: {
		formatVersion: 1,
		appVersion: '1.0.0',
		schemaVersion: 2,
		createdAt: 1_700_000_000_000
	},
	database: new Uint8Array([83, 81, 76])
};

describe('ZipBackupCodec', () => {
	it('round-trips a backup', () => {
		expect(expectOk(codec.decode(codec.encode(backup)))).toEqual(backup);
	});

	it.each([
		['not a zip', new Uint8Array([1, 2, 3])],
		['a zip without a manifest', zipSync({ 'buffalog.sqlite3': new Uint8Array([1]) })],
		[
			'a zip without a database',
			zipSync({ 'manifest.json': strToU8(JSON.stringify(backup.manifest)) })
		],
		[
			'a manifest that is not JSON',
			zipSync({ 'manifest.json': strToU8('{'), 'buffalog.sqlite3': new Uint8Array([1]) })
		],
		[
			'a manifest with missing fields',
			zipSync({
				'manifest.json': strToU8('{"formatVersion":1}'),
				'buffalog.sqlite3': new Uint8Array([1])
			})
		]
	])('rejects %s', (_, file) => {
		expect(expectErr(codec.decode(file))).toBeInstanceOf(UnreadableBackup);
	});
});
