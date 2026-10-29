import { messages } from '../../i18n/messages.en.ts';
import type { Clock } from '../../shared/clock.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { DeleteTemplate } from '../application/delete-template.ts';
import { first } from '../../shared/collections.ts';
import type {
	GetTrainingDays,
	TrainingCalendar,
	TrainingDay
} from '../application/get-training-days.ts';
import type { ListExercises } from '../application/list-exercises.ts';
import type { ListRecentWorkouts } from '../application/list-recent-workouts.ts';
import type { ListTemplates } from '../application/list-templates.ts';
import type { MarkRestDay } from '../application/mark-rest-day.ts';
import type { MoveTemplate } from '../application/move-template.ts';
import type { RemoveRestDay } from '../application/remove-rest-day.ts';
import type { RenameTemplate } from '../application/rename-template.ts';
import type { SaveWorkoutAsTemplate } from '../application/save-workout-as-template.ts';
import type { Exercise } from '../domain/exercise.ts';
import type { WorkoutId, WorkoutTemplateId } from '../domain/ids.ts';
import type { MoveDirection, WorkoutTemplate } from '../domain/workout-template.ts';
import type { FinishedWorkout } from '../domain/workout.ts';

/** The use cases the Train overview calls. */
export interface TrainOverviewUseCases {
	readonly listTemplates: ListTemplates;
	readonly listRecentWorkouts: ListRecentWorkouts;
	readonly listExercises: ListExercises;
	readonly getTrainingDays: GetTrainingDays;
	readonly markRestDay: MarkRestDay;
	readonly removeRestDay: RemoveRestDay;
	readonly saveWorkoutAsTemplate: SaveWorkoutAsTemplate;
	readonly renameTemplate: RenameTemplate;
	readonly moveTemplate: MoveTemplate;
	readonly deleteTemplate: DeleteTemplate;
}

/** How many recent workouts the Train tab lists. */
const RECENT_WORKOUTS = 5;

/** How many days the Train tab's week view shows, ending today. */
const WEEK_DAYS = 7;

/** State and actions of the Train tab when no workout is in progress. */
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

	/** How many of the last seven days, today included, had a workout. */
	get workoutsLastSevenDays(): number {
		return (this.calendar?.days ?? []).filter((day) => day.trained).length;
	}

	/** Whether today had a workout or was marked as a rest day; undefined until loaded. */
	get todayActivity(): TrainingDay | undefined {
		return first(this.calendar?.days ?? []);
	}

	/** The streak line, for example "Streak: 3 days. Best: 5 days." */
	get streakText(): string {
		const streak = this.calendar?.streak;
		return streak === undefined ? '' : messages.training.streak(streak.current, streak.longest);
	}

	/** Loads templates, recent workouts, and the week's days. */
	async load(): Promise<void> {
		[this.templates, this.recent, this.library, this.calendar] = await Promise.all([
			this.useCases.listTemplates.execute(),
			this.useCases.listRecentWorkouts.execute({ limit: RECENT_WORKOUTS }),
			this.useCases.listExercises.execute(),
			this.useCases.getTrainingDays.execute({ days: WEEK_DAYS })
		]);
	}

	/** A workout in words, for example "Squat, Bench press · 8 sets". */
	describe(workout: FinishedWorkout): string {
		const names = workout.exercises.map(
			(exercise) => this.library.find((known) => known.id === exercise.exerciseId)?.name ?? ''
		);
		const sets = workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
		return messages.training.workoutSummary(names.join(', '), sets);
	}

	/** Marks a day as a rest day, or removes the rest day if it already is one. */
	async toggleRestDay(date: LocalDate, rested: boolean): Promise<void> {
		if (rested) {
			await this.useCases.removeRestDay.execute({ date });
		} else {
			await this.useCases.markRestDay.execute({ date });
		}
		this.calendar = await this.useCases.getTrainingDays.execute({ days: WEEK_DAYS });
	}

	/**
	 * Saves a finished workout as a template.
	 *
	 * @returns A message to show if the name was rejected.
	 */
	async saveAsTemplate(workoutId: WorkoutId, name: string): Promise<string | undefined> {
		const result = await this.useCases.saveWorkoutAsTemplate.execute({ workoutId, name });
		await this.load();
		return result.ok ? undefined : messages.training.enterName;
	}

	/**
	 * Renames a template.
	 *
	 * @returns A message to show if the name was rejected.
	 */
	async rename(id: WorkoutTemplateId, name: string): Promise<string | undefined> {
		const result = await this.useCases.renameTemplate.execute({ id, name });
		this.templates = await this.useCases.listTemplates.execute();
		return result.ok ? undefined : messages.training.enterName;
	}

	/** Moves a template up or down the list. */
	async move(id: WorkoutTemplateId, direction: MoveDirection): Promise<void> {
		await this.useCases.moveTemplate.execute({ id, direction });
		this.templates = await this.useCases.listTemplates.execute();
	}

	/** Deletes a template. */
	async remove(id: WorkoutTemplateId): Promise<void> {
		await this.useCases.deleteTemplate.execute({ id });
		this.templates = await this.useCases.listTemplates.execute();
	}
}
