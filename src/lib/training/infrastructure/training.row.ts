/** An `exercise` table row; `tracked_fields` is a comma-separated list and `custom_grades` a JSON array. */
export type ExerciseRow = {
	readonly id: string;
	readonly name: string;
	readonly tracked_fields: string;
	readonly grade_scale: string | null;
	readonly custom_grades: string | null;
	readonly count_label: string | null;
};

/** A `workout` table row; `finished_at` is null while in progress. */
export type WorkoutRow = {
	readonly id: string;
	readonly date: string;
	readonly started_at: number;
	readonly finished_at: number | null;
	readonly note: string;
	readonly source_template_id: string | null;
};

/** A `workout_exercise` table row. */
export type WorkoutExerciseRow = {
	readonly workout_id: string;
	readonly position: number;
	readonly exercise_id: string;
};

/** A `workout_set` table row; `completed` is 0 or 1, and each measure is null when not recorded. */
export type WorkoutSetRow = {
	readonly workout_id: string;
	readonly exercise_position: number;
	readonly position: number;
	readonly reps: number | null;
	readonly weight_kg: number | null;
	readonly seconds: number | null;
	readonly distance_m: number | null;
	readonly grade: number | null;
	readonly count: number | null;
	readonly completed: number;
};

/** A `workout_template` table row. */
export type WorkoutTemplateRow = {
	readonly id: string;
	readonly name: string;
	readonly position: number;
};

/** A `template_exercise` table row. */
export type TemplateExerciseRow = {
	readonly template_id: string;
	readonly position: number;
	readonly exercise_id: string;
	readonly target_sets: number;
};

/** A `rest_day` table row. */
export type RestDayRow = {
	readonly id: string;
	readonly date: string;
};
