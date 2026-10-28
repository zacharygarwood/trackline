import type { Id } from '../../shared/id.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { Mass } from '../../shared/mass.ts';

/** One weigh-in and the 7-day moving average on its day. */
export interface WeightTrendPoint {
	readonly date: LocalDate;
	readonly weight: Mass;
	readonly average: Mass;
}

/** One day with food logged: what was eaten and the goals in effect that day. */
export interface NutritionDay {
	readonly date: LocalDate;
	readonly calories: number;
	readonly protein: number;
	/** Undefined before any goals were set. */
	readonly calorieGoal: number | undefined;
	/** Undefined before any goals were set. */
	readonly proteinGoal: number | undefined;
}

/** Identifies an exercise from the training context. */
export type TrackedExerciseId = Id<'Exercise'>;

/** An exercise with at least one weighted set in a finished workout. */
export interface TrackedExercise {
	readonly id: TrackedExerciseId;
	readonly name: string;
}

/** The best of one day's completed sets of an exercise. */
export interface ExerciseSession {
	readonly date: LocalDate;
	readonly heaviest: Mass;
	readonly estimatedOneRepMax: Mass;
}

/** Days with something logged, each list oldest first. */
export interface ActivityDays {
	readonly trained: readonly LocalDate[];
	readonly rested: readonly LocalDate[];
	readonly foodLogged: readonly LocalDate[];
	readonly proteinGoalMet: readonly LocalDate[];
}

/** Consecutive days with a workout or a rest day. */
export interface StreakSummary {
	/** The run ending today, or yesterday if today has nothing yet. */
	readonly current: number;
	readonly longest: number;
}

/** Reads body weight with its moving average. */
export interface WeightTrendQuery {
	/**
	 * @param since - The first day to include, or undefined for all time.
	 * @returns Points oldest first.
	 */
	weightTrend(since: LocalDate | undefined): Promise<readonly WeightTrendPoint[]>;
}

/** Reads daily nutrition totals against goals. */
export interface NutritionTrendQuery {
	/**
	 * @param since - The first day to include, or undefined for all time.
	 * @returns Days with food logged, oldest first.
	 */
	nutritionDays(since: LocalDate | undefined): Promise<readonly NutritionDay[]>;
}

/** Reads per-exercise strength progress. */
export interface ExerciseProgressQuery {
	/** Exercises with weighted history, most recently trained first. */
	trackedExercises(): Promise<readonly TrackedExercise[]>;
	/**
	 * @param exercise - The exercise to read.
	 * @param since - The first day to include, or undefined for all time.
	 * @returns One session per day trained, oldest first.
	 */
	exerciseSessions(
		exercise: TrackedExerciseId,
		since: LocalDate | undefined
	): Promise<readonly ExerciseSession[]>;
}

/** Reads which days had activity, and the training streak. */
export interface ActivityQuery {
	/** @param since - The first day to include. */
	activityDays(since: LocalDate): Promise<ActivityDays>;
	/** @param today - The day that doesn't break a streak until it is over. */
	trainingStreak(today: LocalDate): Promise<StreakSummary>;
}
