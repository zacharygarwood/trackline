import type { Clock } from '../../shared/clock.ts';
import { last } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { MassUnit } from '../../shared/mass-unit.constants.ts';
import type { GetExerciseHistory } from '../application/get-exercise-history.ts';
import type { GetTrends, Trends } from '../application/get-trends.ts';
import type { GetWorkoutDays } from '../application/get-workout-days.ts';
import type { ExerciseDay, NutritionDay, WorkoutDay } from '../application/insights-queries.ts';
import { StatsRange } from '../application/stats-range.constants.ts';
import { rangeWeeks, startOfDays } from '../application/stats-range.ts';
import { mean, toBars, weeklyCalories } from './stats-math.ts';

/** The use cases the Stats tab calls. */
export interface StatsScreenUseCases {
	readonly getTrends: GetTrends;
	readonly getWorkoutDays: GetWorkoutDays;
	readonly getExerciseHistory: GetExerciseHistory;
}

const DAYS_PER_WEEK = 7;
/** The most points a weight line draws; longer ranges are thinned out. */
const MAX_WEIGHT_POINTS = 70;
/** Headroom above the calorie goal and the highest bar. */
const GOAL_HEADROOM = 1.2;
const BAR_HEADROOM = 1.05;

/** State of the Stats tab: the range, and everything charted over it. */
export class StatsScreen {
	range: StatsRange = $state(StatsRange.threeMonths);
	trends: Trends = $state({ weight: [], nutrition: [] });
	workoutDays: readonly WorkoutDay[] = $state([]);
	exerciseDays: readonly ExerciseDay[] = $state([]);

	constructor(
		private readonly useCases: StatsScreenUseCases,
		private readonly clock: Clock
	) {}

	/** Today's date. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** How many weeks the range covers. */
	get weeks(): number {
		return rangeWeeks(this.range);
	}

	/** Loads everything for the current range. */
	async load(): Promise<void> {
		const range = this.range;
		[this.trends, this.workoutDays, this.exerciseDays] = await Promise.all([
			this.useCases.getTrends.execute({ range }),
			this.useCases.getWorkoutDays.execute(),
			this.useCases.getExerciseHistory.execute({ range })
		]);
	}

	/** Switches the range and reloads. */
	async choose(range: StatsRange): Promise<void> {
		this.range = range;
		await this.load();
	}

	/** The days before today with food logged in the range, newest first. */
	get pastDays(): readonly NutritionDay[] {
		return this.trends.nutrition.filter((day) => day.date.isBefore(this.today)).toReversed();
	}

	/** Minutes of workouts on a day, for the heatmap. */
	readonly minutesOf = (date: LocalDate): number =>
		this.workoutDays.find((day) => day.date.equals(date))?.minutes ?? 0;

	/** How many days in the range had a workout. */
	get workoutDayCount(): number {
		const start = startOfDays(this.today, this.weeks * DAYS_PER_WEEK);
		return this.workoutDays.filter((day) => !day.date.isBefore(start)).length;
	}

	/** Weigh-ins over the range in a unit, oldest first, thinned to at most 70 points. */
	weights(unit: MassUnit): readonly number[] {
		const all = this.trends.weight.map((point) => point.weight.toUnit(unit));
		const step = Math.max(1, Math.round(all.length / MAX_WEIGHT_POINTS));
		const thinned = all.filter((_, index) => index % step === 0);
		const newest = last(all);
		return newest === undefined || last(thinned) === newest ? thinned : [...thinned, newest];
	}

	/** The average daily calories of each bar: one per week, or per four weeks over long ranges. */
	get calorieBars(): readonly number[] {
		return toBars(
			weeklyCalories(this.trends.nutrition, { today: this.today, weeks: this.weeks }),
			mean
		);
	}

	/** The average calories of the days logged in the range. */
	get calorieAverage(): number {
		return mean(this.trends.nutrition.map((day) => day.calories));
	}

	/** The calorie goal in effect most recently, if any. */
	get calorieGoal(): number | undefined {
		return last(this.trends.nutrition)?.calorieGoal;
	}

	/** The calories that fill the chart's height. */
	get calorieScale(): number {
		return Math.max(
			(this.calorieGoal ?? 0) * GOAL_HEADROOM,
			Math.max(0, ...this.calorieBars) * BAR_HEADROOM
		);
	}
}
