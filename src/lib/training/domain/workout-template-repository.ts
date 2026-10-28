import type { WorkoutTemplateId } from './ids.ts';
import type { WorkoutTemplate } from './workout-template.ts';

/** Reads workout templates. */
export interface WorkoutTemplateReader {
	/** Every template, in list order. */
	findAll(): Promise<readonly WorkoutTemplate[]>;
	/** A template by id. */
	findById(id: WorkoutTemplateId): Promise<WorkoutTemplate | undefined>;
}

/** Stores and removes workout templates. */
export interface WorkoutTemplateWriter {
	/** Stores templates, replacing earlier versions; saving several at once keeps their order consistent. */
	save(templates: readonly WorkoutTemplate[]): Promise<void>;
	/** Removes a template. Workouts started from it keep their sets. */
	delete(id: WorkoutTemplateId): Promise<void>;
}
