import type {
	ExerciseReader,
	ExerciseWriter
} from '../../src/lib/training/domain/exercise-repository.ts';
import type { Exercise } from '../../src/lib/training/domain/exercise.ts';
import type {
	ExerciseId,
	WorkoutId,
	WorkoutTemplateId
} from '../../src/lib/training/domain/ids.ts';
import type {
	RestDayReader,
	RestDayWriter
} from '../../src/lib/training/domain/rest-day-repository.ts';
import type { RestDay } from '../../src/lib/training/domain/rest-day.ts';
import type {
	WorkoutReader,
	WorkoutWriter
} from '../../src/lib/training/domain/workout-repository.ts';
import { WorkoutStatus } from '../../src/lib/training/domain/workout-status.constants.ts';
import type {
	WorkoutTemplateReader,
	WorkoutTemplateWriter
} from '../../src/lib/training/domain/workout-template-repository.ts';
import type { WorkoutTemplate } from '../../src/lib/training/domain/workout-template.ts';
import type {
	ActiveWorkout,
	FinishedWorkout,
	Workout
} from '../../src/lib/training/domain/workout.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/** The exercise library in memory; names are unique ignoring case, like the table. */
export class InMemoryExerciseRepository implements ExerciseReader, ExerciseWriter {
	private readonly exercises = new Map<ExerciseId, Exercise>();

	findAll(): Promise<readonly Exercise[]> {
		return Promise.resolve(
			[...this.exercises.values()].toSorted((a, b) => a.name.localeCompare(b.name))
		);
	}

	findByName(name: string): Promise<Exercise | undefined> {
		return Promise.resolve(
			[...this.exercises.values()].find(
				(exercise) => exercise.name.toLowerCase() === name.toLowerCase()
			)
		);
	}

	async save(exercise: Exercise): Promise<void> {
		const clash = await this.findByName(exercise.name);
		if (clash !== undefined && clash.id !== exercise.id)
			throw new Error('UNIQUE constraint failed: exercise.name');
		this.exercises.set(exercise.id, exercise);
	}
}

const newestFirst = (a: Workout, b: Workout) => {
	const byDate = b.date.compareTo(a.date);
	return byDate === 0 ? b.startedAt - a.startedAt : byDate;
};

/** Workouts in memory; at most one can be in progress, like the table's partial unique index. */
export class InMemoryWorkoutRepository implements WorkoutReader, WorkoutWriter {
	private readonly workouts = new Map<WorkoutId, Workout>();

	findActive(): Promise<ActiveWorkout | undefined> {
		return Promise.resolve(
			[...this.workouts.values()].find(
				(workout): workout is ActiveWorkout => workout.status === WorkoutStatus.active
			)
		);
	}

	findById(id: WorkoutId): Promise<Workout | undefined> {
		return Promise.resolve(this.workouts.get(id));
	}

	findRecent(limit: number): Promise<readonly FinishedWorkout[]> {
		return Promise.resolve(this.finished().toSorted(newestFirst).slice(0, limit));
	}

	findLastWith(exerciseId: ExerciseId): Promise<FinishedWorkout | undefined> {
		return Promise.resolve(
			this.finished()
				.filter((workout) =>
					workout.exercises.some((exercise) => exercise.exerciseId === exerciseId)
				)
				.toSorted(newestFirst)
				.at(0)
		);
	}

	findTrainedDates(): Promise<readonly LocalDate[]> {
		const dates = new Map(
			this.finished().map((workout) => [workout.date.toString(), workout.date])
		);
		return Promise.resolve([...dates.values()]);
	}

	async save(workout: Workout): Promise<void> {
		const active = await this.findActive();
		if (
			workout.status === WorkoutStatus.active &&
			active !== undefined &&
			active.id !== workout.id
		) {
			throw new Error('UNIQUE constraint failed: one active workout');
		}
		this.workouts.set(workout.id, workout);
	}

	delete(id: WorkoutId): Promise<void> {
		this.workouts.delete(id);
		return Promise.resolve();
	}

	private finished(): FinishedWorkout[] {
		return [...this.workouts.values()].filter(
			(workout): workout is FinishedWorkout => workout.status === WorkoutStatus.finished
		);
	}
}

/** Templates in memory. */
export class InMemoryWorkoutTemplateRepository
	implements WorkoutTemplateReader, WorkoutTemplateWriter
{
	private readonly templates = new Map<WorkoutTemplateId, WorkoutTemplate>();

	findAll(): Promise<readonly WorkoutTemplate[]> {
		return Promise.resolve(
			[...this.templates.values()].toSorted((a, b) => a.position - b.position)
		);
	}

	findById(id: WorkoutTemplateId): Promise<WorkoutTemplate | undefined> {
		return Promise.resolve(this.templates.get(id));
	}

	save(templates: readonly WorkoutTemplate[]): Promise<void> {
		templates.forEach((template) => this.templates.set(template.id, template));
		return Promise.resolve();
	}

	delete(id: WorkoutTemplateId): Promise<void> {
		this.templates.delete(id);
		return Promise.resolve();
	}
}

/** Rest days in memory, one per date. */
export class InMemoryRestDayRepository implements RestDayReader, RestDayWriter {
	private readonly restDays = new Map<string, RestDay>();

	findByDate(date: LocalDate): Promise<RestDay | undefined> {
		return Promise.resolve(this.restDays.get(date.toString()));
	}

	findAllDates(): Promise<readonly LocalDate[]> {
		return Promise.resolve([...this.restDays.values()].map((restDay) => restDay.date));
	}

	save(restDay: RestDay): Promise<void> {
		this.restDays.set(restDay.date.toString(), restDay);
		return Promise.resolve();
	}

	deleteOn(date: LocalDate): Promise<void> {
		this.restDays.delete(date.toString());
		return Promise.resolve();
	}
}
