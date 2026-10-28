import { beforeEach, describe, expect, it } from 'vitest';
import { FixedClock } from '../../../../tests/fakes/fixed-clock.ts';
import {
	FixedDataInventory,
	InMemoryAppState
} from '../../../../tests/fakes/in-memory-app-state.ts';
import { InMemoryDatabaseFile } from '../../../../tests/fakes/in-memory-database-file.ts';
import type { BackupFile } from '../application/backup-ports.ts';
import { CountRecords } from '../application/count-records.ts';
import { DeleteAllData } from '../application/delete-all-data.ts';
import { ExportBackup } from '../application/export-backup.ts';
import { GetBackupStatus } from '../application/get-backup-status.ts';
import { PreviewRestore } from '../application/preview-restore.ts';
import { RestoreBackup } from '../application/restore-backup.ts';
import { ZipBackupCodec } from '../infrastructure/zip-backup-codec.ts';
import { DataPanel } from './data-panel.svelte.ts';

describe('DataPanel', () => {
	let saved: BackupFile[];
	let database: InMemoryDatabaseFile;
	let panel: DataPanel;

	beforeEach(async () => {
		const clock = new FixedClock(Date.UTC(2026, 9, 27, 12), '2026-10-27');
		const state = new InMemoryAppState();
		const codec = new ZipBackupCodec();
		const inventory = new FixedDataInventory({ weighIns: 3, workouts: 1, foodEntries: 0 });
		database = new InMemoryDatabaseFile(new Uint8Array([5]));
		saved = [];
		panel = new DataPanel(
			{
				getBackupStatus: new GetBackupStatus(state, clock),
				exportBackup: new ExportBackup({
					database,
					codec,
					lastExport: state,
					clock,
					version: { appVersion: '1.0.0', schemaVersion: 2 }
				}),
				previewRestore: new PreviewRestore(codec, inventory, 2),
				restoreBackup: new RestoreBackup(codec, database, 2),
				countRecords: new CountRecords(inventory),
				deleteAllData: new DeleteAllData(database)
			},
			(file) => saved.push(file)
		);
		await panel.load();
	});

	it('nudges before the first backup', () => {
		expect(panel.statusText).toBe(
			'No backup yet. It has been a while. Consider exporting a fresh backup.'
		);
	});

	it('exports a backup and shows when', async () => {
		await panel.export();

		expect(saved.map((file) => file.name)).toEqual(['buffalog-backup-2026-10-27.zip']);
		expect(panel.statusText).toBe('Last backup: Oct 27, 2026.');
	});

	it('describes what a restore replaces, then restores on confirmation', async () => {
		await panel.export();
		const [backup] = saved;
		if (backup === undefined) throw new Error('expected a saved backup');
		database.bytes = new Uint8Array([1]);

		await panel.choose(backup.bytes);
		expect(panel.pendingRestore?.summary).toBe(
			'This replaces everything on this device (3 weigh-ins, 1 workout, 0 food entries) with the backup from Oct 27, 2026.'
		);

		expect(await panel.restore()).toBe(true);
		expect(database.bytes).toEqual(new Uint8Array([5]));
	});

	it('explains a file that is not a backup', async () => {
		await panel.choose(new Uint8Array([1, 2]));

		expect(panel.problem).toBe('That file is not a backup from this app.');
		expect(panel.pendingRestore).toBeUndefined();
	});

	it('says exactly what deleting everything removes', async () => {
		expect(await panel.deletionSummary()).toContain('(3 weigh-ins, 1 workout, 0 food entries)');

		await panel.deleteAll();

		expect(database.bytes).toHaveLength(0);
	});
});
