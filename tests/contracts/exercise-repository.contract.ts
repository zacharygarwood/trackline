import { describe, expect, it } from 'vitest';
import { WEIGHT_AND_REPS } from '../../src/lib/training/domain/tracking.ts';
import { anId, aSet, aWorkout } from '../builders/training.builder.ts';
import type { TrainingRepositories } from './training-repositories.contract.ts';

/** Saves exercises that track weight and reps, returning their ids in order. */
export async function withExercises(repositories: TrainingRepositories, ...names: string[]) {
	const exercises = names.map((name) => ({
		id: anId<'Exercise'>(),
		name,
		tracking: WEIGHT_AND_REPS
	}));
	for (const exercise of exercises) await repositories.exercises.save(exercise);
	return exercises.map((exercise) => exercise.id);
}

/** The behavior every exercise repository must have. */
export function exerciseContract(create: () => Promise<TrainingRepositories>) {
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

		it('lists exercises never used first, newest first, then by latest use', async () => {
			const repositories = await create();
			const [squat, bench, row, curl] = await withExercises(
				repositories,
				'Squat',
				'Bench press',
				'Row',
				'Curl'
			);
			if (squat === undefined || bench === undefined || row === undefined) throw new Error('setup');
			await repositories.workouts.save(
				aWorkout()
					.on('2026-10-20', 100)
					.with(squat, aSet(5, 80, true))
					.finished()
			);
			await repositories.workouts.save(
				aWorkout()
					.on('2026-10-27', 200)
					.with(bench, aSet(5, 60, true))
					.finished()
			);
			await repositories.workouts.save(
				aWorkout()
					.on('2026-10-25', 150)
					.with(squat, aSet(5, 80, true))
					.finished()
			);
			await repositories.workouts.save(
				aWorkout()
					.on('2026-10-22', 120)
					.with(row, aSet(8, 50, true))
					.finished()
			);

			const names = (await repositories.exercises.findAllByRecentUse()).map(
				(exercise) => exercise.name
			);

			expect(curl).toBeDefined();
			expect(names).toEqual(['Curl', 'Bench press', 'Squat', 'Row']);
		});

		it('refuses a second exercise with the same name in different case', async () => {
			const repositories = await create();
			await withExercises(repositories, 'Squat');

			await expect(
				repositories.exercises.save({
					id: anId<'Exercise'>(),
					name: 'SQUAT',
					tracking: WEIGHT_AND_REPS
				})
			).rejects.toThrow();
		});

		it('hides a deleted exercise from the lists, finds it by name, and restores it', async () => {
			const repositories = await create();
			const [squat] = await withExercises(repositories, 'Squat', 'Lunge');
			if (squat === undefined) throw new Error('setup');

			await repositories.exercises.archive(squat);
			const hidden = (await repositories.exercises.findAll()).map((exercise) => exercise.name);
			const recent = (await repositories.exercises.findAllByRecentUse()).map(
				(exercise) => exercise.name
			);
			const found = await repositories.exercises.findByName('squat');
			const restored = await repositories.exercises.restore(squat);
			const restoredAgain = await repositories.exercises.restore(squat);

			expect(hidden).toEqual(['Lunge']);
			expect(recent).toEqual(['Lunge']);
			expect(found?.id).toBe(squat);
			expect([restored, restoredAgain]).toEqual([true, false]);
			expect(await repositories.exercises.findAll()).toHaveLength(2);
		});
	});
}
