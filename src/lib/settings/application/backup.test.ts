import { beforeEach, describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import {
	FixedDataInventory,
	InMemoryAppState
} from '../../../../tests/fakes/in-memory-app-state.ts';
import { InMemoryDatabaseFile } from '../../../../tests/fakes/in-memory-database-file.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { BackupFromNewerVersion, UnreadableBackup } from '../domain/backup.ts';
import { ZipBackupCodec } from '../infrastructure/zip-backup-codec.ts';
import { DeleteAllData } from './delete-all-data.ts';
import { ExportBackup } from './export-backup.ts';
import { GetBackupStatus } from './get-backup-status.ts';
import { PreviewRestore } from './preview-restore.ts';
import { RestoreBackup } from './restore-backup.ts';

const DAY = 86_400_000;
const codec = new ZipBackupCodec();

describe('backup use cases', () => {
	let clock: FixedClock;
	let state: InMemoryAppState;
	let database: InMemoryDatabaseFile;

	const exportBackup = (schemaVersion = 2) =>
		new ExportBackup({
			database,
			codec,
			lastExport: state,
			clock,
			version: { appVersion: '1.0.0', schemaVersion }
		}).execute();

	beforeEach(() => {
		clock = new FixedClock(Date.UTC(2026, 9, 27, 9), '2026-10-27');
		state = new InMemoryAppState();
		database = new InMemoryDatabaseFile(new Uint8Array([9, 8, 7]));
	});

	it('exports a dated backup file and remembers when', async () => {
		const file = await exportBackup();

		expect(file.name).toBe('buffalog-backup-2026-10-27.zip');
		expect(await state.read()).toBe(clock.now());
	});

	it('previews a restore without changing anything', async () => {
		const file = await exportBackup();
		database.bytes = new Uint8Array([1]);

		const preview = expectOk(
			await new PreviewRestore(
				codec,
				new FixedDataInventory({ weighIns: 4, workouts: 0 }),
				2
			).execute({
				file: file.bytes
			})
		);

		expect(preview).toEqual({
			backupCreatedAt: clock.now(),
			replaces: { weighIns: 4, workouts: 0 }
		});
		expect(database.bytes).toEqual(new Uint8Array([1]));
	});

	it('restores the backed-up database', async () => {
		const file = await exportBackup();
		database.bytes = new Uint8Array([1]);

		expectOk(await new RestoreBackup(codec, database, 2).execute({ file: file.bytes }));

		expect(database.bytes).toEqual(new Uint8Array([9, 8, 7]));
	});

	it('refuses a backup from a newer version', async () => {
		const file = await exportBackup(5);

		const problem = expectErr(
			await new RestoreBackup(codec, database, 2).execute({ file: file.bytes })
		);

		expect(problem).toBeInstanceOf(BackupFromNewerVersion);
		expect(database.bytes).toEqual(new Uint8Array([9, 8, 7]));
	});

	it('refuses a file that is not a backup', async () => {
		const preview = await new PreviewRestore(
			codec,
			new FixedDataInventory({ weighIns: 0, workouts: 0 }),
			2
		).execute({
			file: new Uint8Array([1, 2, 3])
		});

		expect(expectErr(preview)).toBeInstanceOf(UnreadableBackup);
	});

	it('deletes all data', async () => {
		await new DeleteAllData(database).execute();

		expect(database.bytes).toHaveLength(0);
	});

	it('suggests a backup until one is made, then again after 30 days', async () => {
		const status = new GetBackupStatus(state, clock);
		expect((await status.execute()).overdue).toBe(true);

		await exportBackup();
		expect((await status.execute()).overdue).toBe(false);

		clock.advance(31 * DAY);
		expect(await status.execute()).toEqual({
			lastExportAt: Date.UTC(2026, 9, 27, 9),
			overdue: true
		});
	});
});
