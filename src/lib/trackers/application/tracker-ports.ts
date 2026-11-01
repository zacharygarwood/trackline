import type { LocalDate } from '../../shared/local-date.ts';
import type {
	TrackerEntryReader,
	TrackerEntryWriter,
	TrackerReader,
	TrackerSetup,
	TrackerWriter
} from '../domain/tracker-repository.ts';
import type { ExerciseMeasure, MacroMeasure } from '../domain/tracker.constants.ts';
import type { TrackerId } from '../domain/tracker.ts';

/** Reads and writes trackers. */
export type Trackers = TrackerReader & TrackerWriter;

/** Reads and writes values logged to trackers. */
export type TrackerEntries = TrackerEntryReader & TrackerEntryWriter;

/** Reads and writes whether the starting trackers were made. */
export type Setup = TrackerSetup;

/** The numbers trackers read from the food log, workouts, and weigh-ins. */
export interface TrackerSources {
	/** Calories, or grams of protein, carbs, or fat, logged on or after a day. */
	macroTotal(measure: MacroMeasure, since: LocalDate): Promise<number>;
	/** How much of one food was logged on or after a day, in its own unit. */
	foodAmount(foodId: string, since: LocalDate): Promise<number>;
	/** Finished workouts on or after a day. */
	workoutCount(since: LocalDate): Promise<number>;
	/**
	 * One exercise's sessions, metres, minutes, reps, or completed sets in
	 * finished workouts on or after a day.
	 */
	exerciseTotal(exerciseId: string, measure: ExerciseMeasure, since: LocalDate): Promise<number>;
	/** Every weigh-in in kilograms, oldest first. */
	weights(): Promise<readonly number[]>;
}

/** Raised when a tracker no longer exists. */
export class TrackerNotFound {
	/** @param id - The missing tracker. */
	constructor(readonly id: TrackerId) {}
}
