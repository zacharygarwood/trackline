import type { Clock } from '../../shared/clock.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import type { GetActivity } from '../application/get-activity.ts';
import type { GetExerciseProgress } from '../application/get-exercise-progress.ts';
import type { GetTrends, Trends } from '../application/get-trends.ts';
import type {
	ActivityDays,
	ExerciseSession,
	StreakSummary,
	TrackedExercise
} from '../application/insights-queries.ts';
import type { ListTrackedExercises } from '../application/list-tracked-exercises.ts';
import { StatsRange } from '../application/stats-range.constants.ts';
import { activityHeatmaps } from './activity-heatmaps.ts';
import { Nutrient } from './nutrient.constants.ts';
import { exerciseChartData, nutritionChartData, weightChartData } from './stats-charts.ts';

/** Reads the unit the user shows weights in; supplied by the settings context. */
export interface MassUnitSource {
	execute(): Promise<MassUnit>;
}

/** Reads the day the user's weeks begin on; supplied by the settings context. */
export interface WeekStartSource {
	execute(): Promise<WeekStart>;
}

/** The use cases the Stats screen calls. */
export interface StatsScreenUseCases {
	readonly getActivity: GetActivity;
	readonly getTrends: GetTrends;
	readonly listTrackedExercises: ListTrackedExercises;
	readonly getExerciseProgress: GetExerciseProgress;
	readonly getMassUnit: MassUnitSource;
	readonly getWeekStart: WeekStartSource;
}

const NO_ACTIVITY: ActivityDays = { trained: [], rested: [], foodLogged: [], proteinGoalMet: [] };

/** State and actions of the Stats tab: streaks, heatmaps, and charts over a chosen range. */
export class StatsScreen {
	range: StatsRange = $state(StatsRange.fourWeeks);
	unit: MassUnit = $state(MassUnit.kg);
	weekStart: WeekStart = $state(WeekStart.monday);
	streak: StreakSummary = $state({ current: 0, longest: 0 });
	exercises: readonly TrackedExercise[] = $state([]);
	exercise: TrackedExercise | undefined = $state();
	private activity: ActivityDays = $state(NO_ACTIVITY);
	private trends: Trends = $state({ weight: [], nutrition: [] });
	private sessions: readonly ExerciseSession[] = $state([]);

	readonly heatmaps = $derived(activityHeatmaps(this.activity));
	readonly weightChart = $derived(weightChartData(this.trends.weight, this.unit));
	readonly caloriesChart = $derived(nutritionChartData(this.trends.nutrition, Nutrient.calories));
	readonly proteinChart = $derived(nutritionChartData(this.trends.nutrition, Nutrient.protein));
	readonly exerciseChart = $derived(
		this.exercise === undefined
			? undefined
			: exerciseChartData(this.sessions, this.exercise.name, this.unit)
	);

	constructor(
		private readonly useCases: StatsScreenUseCases,
		private readonly clock: Clock
	) {}

	/** The last day the heatmaps show. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** Loads everything the screen shows for the current range. */
	async load(): Promise<void> {
		const [activity, unit, weekStart, exercises] = await Promise.all([
			this.useCases.getActivity.execute(),
			this.useCases.getMassUnit.execute(),
			this.useCases.getWeekStart.execute(),
			this.useCases.listTrackedExercises.execute()
		]);
		this.weekStart = weekStart;
		this.activity = activity.days;
		this.streak = activity.streak;
		this.unit = unit;
		this.exercises = exercises;
		this.exercise = first(exercises);
		await Promise.all([this.loadTrends(), this.loadSessions()]);
	}

	/**
	 * Shows the charts for another range.
	 *
	 * @param range - The range to show.
	 */
	async changeRange(range: StatsRange): Promise<void> {
		this.range = range;
		await Promise.all([this.loadTrends(), this.loadSessions()]);
	}

	/**
	 * Shows another exercise's progress. Ignores ids that aren't in the list.
	 *
	 * @param id - The chosen exercise's id, as the picker reports it.
	 */
	async chooseExercise(id: string): Promise<void> {
		const chosen = this.exercises.find((exercise) => exercise.id === id);
		if (chosen === undefined) return;
		this.exercise = chosen;
		this.sessions = [];
		await this.loadSessions();
	}

	private async loadTrends(): Promise<void> {
		const range = this.range;
		const trends = await this.useCases.getTrends.execute({ range });
		if (range === this.range) this.trends = trends;
	}

	private async loadSessions(): Promise<void> {
		const { range, exercise } = this;
		if (exercise === undefined) return;
		const sessions = await this.useCases.getExerciseProgress.execute({
			exercise: exercise.id,
			range
		});
		if (range === this.range && exercise.id === this.exercise?.id) this.sessions = sessions;
	}
}
