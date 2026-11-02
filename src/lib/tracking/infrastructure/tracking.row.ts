/** A `tracker` table row, column for column. */
export type TrackerRow = {
	readonly id: string;
	readonly name: string;
	readonly icon: string;
	readonly kind: string;
	readonly position: number;
	/** A JSON array of fields. */
	readonly fields: string;
	/** A JSON goal. The column allows null, but a tracker without a goal is not read. */
	readonly goal: string | null;
};

/** A `subject` table row, column for column. */
export type SubjectRow = {
	readonly id: string;
	readonly tracker_id: string;
	readonly name: string;
	/** A JSON array of field keys. */
	readonly field_keys: string;
	/** A JSON object of default values by field key. */
	readonly defaults: string;
	/** 1 when deleted from the library, else 0. */
	readonly archived: number;
	/** A JSON object of a recipe's ingredients and the servings it makes; null for a plain thing. */
	readonly recipe: string | null;
};

/** A `session` table row, column for column. */
export type SessionRow = {
	readonly id: string;
	readonly tracker_id: string;
	readonly date: string;
	readonly started_at: number;
	readonly finished_at: number | null;
};

/** An `entry` table row, column for column. */
export type EntryRow = {
	readonly id: string;
	readonly tracker_id: string;
	readonly date: string;
	readonly logged_at: number;
	readonly subject_id: string | null;
	readonly session_id: string | null;
	/** A JSON object of values by field key. */
	readonly field_values: string;
};
