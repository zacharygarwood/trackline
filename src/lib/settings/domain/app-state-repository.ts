/** Remembers when the user last exported a backup. */
export interface LastExportStore {
	/** When the user last exported, in epoch milliseconds, if ever. */
	read(): Promise<number | undefined>;
	/** Records an export at the given instant. */
	write(exportedAt: number): Promise<void>;
}

/** Remembers whether the user has been through the first-run screen. */
export interface SetupStatusStore {
	/** Whether first-run setup is done. */
	isComplete(): Promise<boolean>;
	/** Marks first-run setup as done. */
	markComplete(): Promise<void>;
}
