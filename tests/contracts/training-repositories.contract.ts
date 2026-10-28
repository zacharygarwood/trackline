import { describe, expect, it } from 'vitest';
import type {
	ExerciseReader,
	ExerciseWriter
} from '../../src/lib/training/domain/exercise-repository.ts';
import type {
	RestDayReader,
	RestDayWriter
} from '../../src/lib/training/domain/rest-day-repository.ts';
import type {
	WorkoutReader,
	WorkoutWriter
} from '../../src/lib/training/domain/workout-repository.ts';
import type {
	WorkoutTemplateReader,
	WorkoutTemplateWriter
} from '../../src/lib/training/domain/workout-template-repository.ts';
import type { WorkoutTemplate } from '../../src/lib/training/domain/workout-template.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { anId, aSet, aTemplateId, aWorkout } from '../builders/training.builder.ts';
import { expectOk } from '../support/result.ts';

/** Repositories that store training data, sharing one database where it matters. */
export interface TrainingRepositories {
	readonly exercises: ExerciseReader & ExerciseWriter;
	readonly workouts: WorkoutReader & WorkoutWriter;
	readonly templates: WorkoutTemplateReader & WorkoutTemplateWriter;
	readonly restDays: RestDayReader & RestDayWriter;
}

const date = (text: string) => expectOk(LocalDate.parse(text));

async function withExercises(repositories: TrainingRepositories, ...names: string[]) {
	const exercises = names.map((name) => ({ id: anId<'Exercise'>(), name }));
	for (const exercise of exercises) await repositories.exercises.save(exercise);
	return exercises.map((exercise) => exercise.id);
}

function exerciseContract(create: () => Promise<TrainingRepositories>) {
	describe('exercise repository contract', () => {
		it('lists exercises by name and finds them ignoring case', async () => {
			const repositories = await create();
			await withExercises(repositories, 'Squat', 'Bench press');

			expect((await repositories.exercises.findAll()).map((exercise) => exercise.name)).toEqual([
				'Bench press',
				'Squat'
			]);
			expect((await repositories.exercises.findByName('bench PRESS'))?.name).toBe('Bench press');
		});

		it('refuses a second exercise with the same name in different case', async () => {
			const repositories = await create();
			await withExercises(repositories, 'Squat');

			await expect(
				repositories.exercises.save({ id: anId<'Exercise'>(), name: 'SQUAT' })
			).rejects.toThrow();
		});
	});
}

function workoutContract(create: () => Promise<TrainingRepositories>) {
	describe('workout repository contract', () => {
		it('round-trips a workout with exercises and sets in order', async () => {
			const repositories = await create();
			const [squat, bench] = await withExercises(repositories, 'Squat', 'Bench press');
			const workout = aWorkout()
				.with(bench ?? anId(), aSet(8, 60, true), aSet(6, 62.5, false))
				.with(squat ?? anId(), aSet(5, 100, true))
				.active();

			await repositories.workouts.save({ ...workout, note: 'Felt good' });

			expect(await repositories.workouts.findActive()).toEqual({ ...workout, note: 'Felt good' });
			expect(await repositories.workouts.findById(workout.id)).toEqual({
				...workout,
				note: 'Felt good'
			});
		});

		it('keeps only one workout in progress', async () => {
			const repositories = await create();
			await repositories.workouts.save(aWorkout().active());

			await expect(repositories.workouts.save(aWorkout().active())).rejects.toThrow();
		});

		it('replaces a saved workout, including removed sets and exercises', async () => {
			const repositories = await create();
			const [squat, bench] = await withExercises(repositories, 'Squat', 'Bench press');
			const workout = aWorkout()
				.with(squat ?? anId(), aSet(5, 100), aSet(5, 100))
				.with(bench ?? anId(), aSet(8, 60))
				.active();
			await repositories.workouts.save(workout);

			const smaller = {
				...workout,
				exercises: [{ exerciseId: squat ?? anId(), sets: [aSet(3, 110, true)] }]
			};
			await repositories.workouts.save(smaller);

			expect(await repositories.workouts.findActive()).toEqual(smaller);
		});

		it('lists finished workouts newest first and finds the last with an exercise', async () => {
			const repositories = await create();
			const [squat, bench] = await withExercises(repositories, 'Squat', 'Bench press');
			const older = aWorkout()
				.on('2026-10-01')
				.with(squat ?? anId(), aSet(5, 100, true))
				.finished();
			const newer = aWorkout()
				.on('2026-10-03')
				.with(bench ?? anId(), aSet(8, 60, true))
				.finished();
			await repositories.workouts.save(older);
			await repositories.workouts.save(newer);
			await repositories.workouts.save(
				aWorkout()
					.on('2026-10-04')
					.with(squat ?? anId(), aSet(1, 1))
					.active()
			);

			expect((await repositories.workouts.findRecent(5)).map((workout) => workout.id)).toEqual([
				newer.id,
				older.id
			]);
			expect((await repositories.workouts.findLastWith(squat ?? anId()))?.id).toBe(older.id);
			expect(
				(await repositories.workouts.findTrainedDates())
					.map((day) => day.toString())
					.toSorted((a, b) => a.localeCompare(b))
			).toEqual(['2026-10-01', '2026-10-03']);
		});

		it('deletes a workout', async () => {
			const repositories = await create();
			const workout = aWorkout().active();
			await repositories.workouts.save(workout);

			await repositories.workouts.delete(workout.id);

			expect(await repositories.workouts.findActive()).toBeUndefined();
		});
	});
}

function templateContract(create: () => Promise<TrainingRepositories>) {
	describe('workout template repository contract', () => {
		it('saves templates and lists them in order', async () => {
			const repositories = await create();
			const [squat, bench] = await withExercises(repositories, 'Squat', 'Bench press');
			const second: WorkoutTemplate = {
				id: aTemplateId(),
				name: 'Push',
				position: 1,
				exercises: [{ exerciseId: bench ?? anId(), targetSets: 3 }]
			};
			const first: WorkoutTemplate = {
				id: aTemplateId(),
				name: 'Legs',
				position: 0,
				exercises: [
					{ exerciseId: squat ?? anId(), targetSets: 5 },
					{ exerciseId: bench ?? anId(), targetSets: 2 }
				]
			};
			await repositories.templates.save([second, first]);

			expect(await repositories.templates.findAll()).toEqual([first, second]);
			expect(await repositories.templates.findById(first.id)).toEqual(first);
		});

		it('replaces and deletes templates', async () => {
			const repositories = await create();
			const [squat] = await withExercises(repositories, 'Squat');
			const template: WorkoutTemplate = {
				id: aTemplateId(),
				name: 'Legs',
				position: 0,
				exercises: [{ exerciseId: squat ?? anId(), targetSets: 5 }]
			};
			await repositories.templates.save([template]);
			await repositories.templates.save([{ ...template, name: 'Leg day' }]);
			expect((await repositories.templates.findById(template.id))?.name).toBe('Leg day');

			await repositories.templates.delete(template.id);

			expect(await repositories.templates.findAll()).toEqual([]);
		});
	});
}

function restDayContract(create: () => Promise<TrainingRepositories>) {
	describe('rest day repository contract', () => {
		it('marks, finds, and removes rest days by date', async () => {
			const repositories = await create();
			const restDay = { id: anId<'RestDay'>(), date: date('2026-10-27') };
			await repositories.restDays.save(restDay);

			expect(await repositories.restDays.findByDate(date('2026-10-27'))).toEqual(restDay);
			expect((await repositories.restDays.findAllDates()).map((day) => day.toString())).toEqual([
				'2026-10-27'
			]);

			await repositories.restDays.deleteOn(date('2026-10-27'));
			expect(await repositories.restDays.findByDate(date('2026-10-27'))).toBeUndefined();
		});
	});
}

/** The behavior every training repository must have, for the fakes and for SQLite. */
export function describeTrainingRepositories(create: () => Promise<TrainingRepositories>): void {
	exerciseContract(create);
	workoutContract(create);
	templateContract(create);
	restDayContract(create);
}
