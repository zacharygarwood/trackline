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

/** One day with at least one finished workout. */
export interface WorkoutDay {
	readonly date: LocalDate;
	/** How long that day's workouts took together. */
	readonly minutes: number;
}

/** Identifies an exercise from the training context. */
export type TrackedExerciseId = Id<'Exercise'>;

/** What was done of one exercise on one day, from completed sets of finished workouts. */
export interface ExerciseDay {
	readonly exerciseId: TrackedExerciseId;
	readonly date: LocalDate;
	/** The heaviest weight, if any set recorded one. */
	readonly heaviest: Mass | undefined;
	/** The most reps in one set, if any set recorded reps. */
	readonly mostReps: number | undefined;
	/** The hardest grade's position on its scale, if any set recorded a grade. */
	readonly hardestGrade: number | undefined;
	/** Totals across the day's sets; zero when not recorded. */
	readonly meters: number;
	readonly seconds: number;
	readonly count: number;
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

/** Reads which days had workouts and how long they took. */
export interface WorkoutDaysQuery {
	/**
	 * @param since - The first day to include.
	 * @returns Days with a finished workout, oldest first.
	 */
	workoutDays(since: LocalDate): Promise<readonly WorkoutDay[]>;
}

/** Reads what was done of each exercise over time. */
export interface ExerciseHistoryQuery {
	/**
	 * @param since - The first day to include, or undefined for all time.
	 * @returns One row per exercise per day trained, oldest first.
	 */
	exerciseDays(since: LocalDate | undefined): Promise<readonly ExerciseDay[]>;
}
