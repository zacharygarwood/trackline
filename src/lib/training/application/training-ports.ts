import type { Clock } from '../../shared/clock.ts';
import type { IdGenerator } from '../../shared/id-generator.ts';
import type { ExerciseReader, ExerciseWriter } from '../domain/exercise-repository.ts';
import type { RestDayReader, RestDayWriter } from '../domain/rest-day-repository.ts';
import type { WorkoutReader, WorkoutWriter } from '../domain/workout-repository.ts';
import type {
	WorkoutTemplateReader,
	WorkoutTemplateWriter
} from '../domain/workout-template-repository.ts';

/** Reads and writes workouts. */
export type Workouts = WorkoutReader & WorkoutWriter;

/** Reads and writes the exercise library. */
export type Exercises = ExerciseReader & ExerciseWriter;

/** Reads and writes templates. */
export type Templates = WorkoutTemplateReader & WorkoutTemplateWriter;

/** Reads and writes rest days. */
export type RestDays = RestDayReader & RestDayWriter;

/** Time and identity sources for creating new training records. */
export interface Creation {
	readonly clock: Clock;
	readonly ids: IdGenerator;
}
