import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { FoodUnit } from '../../shared/food-unit.constants.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { HomeTracker, Theme } from './preferences.constants.ts';

const ONE_MINUTE = 60;
const MINUTE_AND_A_HALF = 90;
const TWO_MINUTES = 120;
const THREE_MINUTES = 180;

/** The rest timer lengths a user can choose, in seconds. */
export const REST_TIMER_SECONDS = [
	ONE_MINUTE,
	MINUTE_AND_A_HALF,
	TWO_MINUTES,
	THREE_MINUTES
] as const;

/** One of the {@link REST_TIMER_SECONDS}. */
export type RestTimerSeconds = (typeof REST_TIMER_SECONDS)[number];

/** The units new foods can default to. */
export const NEW_FOOD_UNITS = [FoodUnit.serving, FoodUnit.g, FoodUnit.oz] as const;

/** One of the {@link NEW_FOOD_UNITS}. */
export type NewFoodUnit = (typeof NEW_FOOD_UNITS)[number];

/** The fewest workouts a week the user can aim for. */
export const MIN_WEEKLY_WORKOUTS = 1;

/** The most workouts a week the user can aim for: one a day. */
export const MAX_WEEKLY_WORKOUTS = 7;

/** How the app looks and what it tracks, as the user set it. */
export interface Preferences {
	readonly theme: Theme;
	/** Whether carbs and fat are shown and asked for, beside calories and protein. */
	readonly trackCarbsAndFat: boolean;
	readonly distanceUnit: DistanceUnit;
	/** The unit the new-food form starts on. */
	readonly newFoodUnit: NewFoodUnit;
	/** How long the rest timer runs after a set. */
	readonly restSeconds: RestTimerSeconds;
	/** How many workouts a week the user aims for. */
	readonly weeklyWorkoutGoal: number;
	/** The progress bars Home shows, in order. */
	readonly homeTrackers: readonly HomeTracker[];
}

/** What a new user starts with. */
export const DEFAULT_PREFERENCES: Preferences = {
	theme: Theme.dark,
	trackCarbsAndFat: false,
	distanceUnit: DistanceUnit.mi,
	newFoodUnit: FoodUnit.serving,
	restSeconds: MINUTE_AND_A_HALF,
	weeklyWorkoutGoal: 4,
	homeTrackers: [
		HomeTracker.calories,
		HomeTracker.protein,
		HomeTracker.workouts,
		HomeTracker.weight
	]
};

/** Raised when a weekly workout goal is not a whole number from 1 to 7. */
export class InvalidWeeklyWorkoutGoal {
	/** @param goal - The rejected value. */
	constructor(readonly goal: number) {}
}

/**
 * Checks a weekly workout goal.
 *
 * @param goal - Workouts a week, as entered.
 */
export function parseWeeklyWorkoutGoal(goal: number): Result<number, InvalidWeeklyWorkoutGoal> {
	return Number.isInteger(goal) && goal >= MIN_WEEKLY_WORKOUTS && goal <= MAX_WEEKLY_WORKOUTS
		? ok(goal)
		: err(new InvalidWeeklyWorkoutGoal(goal));
}

/** Reads the stored preferences. */
export interface PreferencesReader {
	/** The preferences the user has set; the rest are missing. */
	read(): Promise<Partial<Preferences>>;
}

/** Stores preferences. */
export interface PreferencesWriter {
	/** Remembers the given preferences, leaving the others as they are. */
	write(changes: Partial<Preferences>): Promise<void>;
}
