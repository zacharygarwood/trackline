import { TemplateField } from '../domain/template.constants.ts';

/** What an exercise can track, as plain choices instead of a list of fields. */
export const ExercisePreset = {
	lift: 'lift',
	reps: 'reps',
	time: 'time',
	cardio: 'cardio'
} as const;

/** One of the {@link ExercisePreset} values. */
export type ExercisePreset = (typeof ExercisePreset)[keyof typeof ExercisePreset];

/** The workout fields each preset fills. */
export const EXERCISE_PRESET_FIELDS: Readonly<Record<ExercisePreset, readonly TemplateField[]>> = {
	lift: [TemplateField.reps, TemplateField.weight],
	reps: [TemplateField.reps],
	time: [TemplateField.time],
	cardio: [TemplateField.distance, TemplateField.time]
};
