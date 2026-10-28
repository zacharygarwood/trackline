/** How many records of each kind the device holds; shown before anything is overwritten. */
export interface DataCounts {
	readonly weighIns: number;
}

/** Counts the stored records. */
export interface DataInventory {
	/** The current record counts. */
	count(): Promise<DataCounts>;
}
