import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { WeekStart } from '../../shared/week-start.constants.ts';
import type { GetTrainingDays, TrainingCalendar } from '../application/get-training-days.ts';
import type { ListExercises } from '../application/list-exercises.ts';
import type { ListRecentWorkouts } from '../application/list-recent-workouts.ts';
import type { ListTemplates } from '../application/list-templates.ts';
import type { SaveWorkoutAsTemplate } from '../application/save-workout-as-template.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { WorkoutTemplate } from '../domain/workout-template.ts';
import type { FinishedWorkout } from '../domain/workout.ts';
import { weekStrip, type WeekStripDay } from './week-strip.ts';
import {
	elapsedClock,
	exerciseSummary,
	workoutName,
	type TrainingUnits
} from './workout-format.ts';

/** The use cases the training overviews on Today and Stats call. */
export interface TrainOverviewUseCases {
	readonly listTemplates: ListTemplates;
	readonly listRecentWorkouts: ListRecentWorkouts;
	readonly listExercises: ListExercises;
	readonly getTrainingDays: GetTrainingDays;
	readonly saveWorkoutAsTemplate: SaveWorkoutAsTemplate;
}

/** One line of a finished workout's summary: its duration, or one exercise. */
export interface WorkoutSummaryRow {
	readonly label: string;
	readonly value: string;
}

/** How many recent workouts Stats lists. */
const RECENT_WORKOUTS = 6;

/** How many days back the week strip needs: a whole week. */
const WEEK_DAYS = 7;

/** Recent training: this week's days for Today, and finished workouts for Stats. */
export class TrainOverview {
	templates: readonly WorkoutTemplate[] = $state([]);
	recent: readonly FinishedWorkout[] = $state([]);
	library: readonly Exercise[] = $state([]);
	calendar: TrainingCalendar | undefined = $state();

	constructor(
		private readonly useCases: TrainOverviewUseCases,
		private readonly clock: Clock
	) {}

	/** Today's date. */
	get today(): LocalDate {
		return this.clock.today();
	}

	/** Loads saved workouts, recent workouts, the library, and the last week's days. */
	async load(): Promise<void> {
		[this.templates, this.recent, this.library, this.calendar] = await Promise.all([
			this.useCases.listTemplates.execute(),
			this.useCases.listRecentWorkouts.execute({ limit: RECENT_WORKOUTS }),
			this.useCases.listExercises.execute(),
			this.useCases.getTrainingDays.execute({ days: WEEK_DAYS })
		]);
	}

	/**
	 * The current calendar week and what happened on each day so far.
	 *
	 * @param weekStart - The day weeks begin on.
	 */
	thisWeek(weekStart: WeekStart): readonly WeekStripDay[] {
		return weekStrip({ today: this.today, weekStart, days: this.calendar?.days ?? [] });
	}

	/** A finished workout's name. */
	nameOf(workout: FinishedWorkout): string {
		return workoutName(workout, this.templates, (id) => this.exerciseOf(id)?.name ?? '');
	}

	/** A finished workout's duration, then each exercise's summary. */
	summaryOf(workout: FinishedWorkout, units: TrainingUnits): readonly WorkoutSummaryRow[] {
		return [
			{ label: '', value: elapsedClock(workout.startedAt, workout.finishedAt) },
			...workout.exercises.flatMap((entry) => {
				const exercise = this.exerciseOf(entry.exerciseId);
				return exercise === undefined
					? []
					: [{ label: exercise.name, value: exerciseSummary(entry.sets, exercise, units) }];
			})
		];
	}

	/** Whether a workout could be saved: no saved workout has its name yet. */
	canSave(workout: FinishedWorkout): boolean {
		const name = this.nameOf(workout).toLowerCase();
		return !this.templates.some((template) => template.name.toLowerCase() === name);
	}

	/** Saves a finished workout to the Workouts list under its name. */
	async save(workout: FinishedWorkout): Promise<boolean> {
		const result = await this.useCases.saveWorkoutAsTemplate.execute({
			workoutId: workout.id,
			name: this.nameOf(workout)
		});
		this.templates = await this.useCases.listTemplates.execute();
		return result.ok;
	}

	private exerciseOf(id: Exercise['id']): Exercise | undefined {
		return this.library.find((exercise) => exercise.id === id);
	}
}
