import type {
	LastExportStore,
	SetupStatusStore
} from '../../src/lib/settings/domain/app-state-repository.ts';
import type { DataCounts, DataInventory } from '../../src/lib/settings/domain/data-inventory.ts';

/** App state kept in fields: last export time and first-run status. */
export class InMemoryAppState implements LastExportStore, SetupStatusStore {
	private lastExportAt: number | undefined;
	private setupComplete = false;

	read(): Promise<number | undefined> {
		return Promise.resolve(this.lastExportAt);
	}

	write(exportedAt: number): Promise<void> {
		this.lastExportAt = exportedAt;
		return Promise.resolve();
	}

	isComplete(): Promise<boolean> {
		return Promise.resolve(this.setupComplete);
	}

	markComplete(): Promise<void> {
		this.setupComplete = true;
		return Promise.resolve();
	}
}

/** A data inventory that reports fixed counts. */
export class FixedDataInventory implements DataInventory {
	constructor(private readonly counts: DataCounts) {}

	count(): Promise<DataCounts> {
		return Promise.resolve(this.counts);
	}
}
