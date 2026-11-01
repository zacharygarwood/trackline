/** A `tracker` table row, column for column. */
export type TrackerRow = {
	readonly id: string;
	readonly name: string;
	readonly position: number;
	readonly measure: string;
	readonly subject_id: string | null;
	readonly unit: string;
	readonly goal: number;
	readonly direction: string;
	readonly period: string;
	readonly combine: string;
};

/** A `tracker_entry` table row, column for column. */
export type TrackerEntryRow = {
	readonly id: string;
	readonly tracker_id: string;
	readonly date: string;
	readonly value: number;
};
