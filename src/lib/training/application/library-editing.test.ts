import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { trainingApp } from '../../../../tests/support/training-app.ts';
import { InvalidName } from '../domain/name.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { EmptyTemplate } from '../domain/workout-template.ts';
import { ExerciseExists } from './create-exercise.ts';
import { ExerciseInUse } from './delete-exercise.ts';
import { ExerciseNotFound } from './rename-exercise.ts';
import { TemplateNotFound } from './start-workout.ts';

async function withExercises(app: ReturnType<typeof trainingApp>, ...names: string[]) {
	const created = [];
	for (const name of names) {
		created.push(expectOk(await app.createExercise.execute({ name, tracking: WEIGHT_AND_REPS })));
	}
	return created;
}

const names = (exercises: readonly { name: string }[]) => exercises.map(({ name }) => name);

describe('editing exercises', () => {
	it('renames an exercise, keeping names unique and valid', async () => {
		const app = trainingApp();
		const [squat] = await withExercises(app, 'Squat', 'Lunge');
		if (squat === undefined) throw new Error('setup');

		const renamed = expectOk(
			await app.renameExercise.execute({ id: squat.id, name: ' back  squat ' })
		);

		expect(renamed).toEqual({ ...squat, name: 'back squat' });
		expect(names(await app.listExercises.execute())).toEqual(['back squat', 'Lunge']);
		expect(
			expectErr(await app.renameExercise.execute({ id: squat.id, name: 'LUNGE' }))
		).toBeInstanceOf(ExerciseExists);
		expect(expectErr(await app.renameExercise.execute({ id: squat.id, name: ' ' }))).toBeInstanceOf(
			InvalidName
		);
		expect(
			expectErr(await app.renameExercise.execute({ id: anId<'Exercise'>(), name: 'Row' }))
		).toBeInstanceOf(ExerciseNotFound);
	});

	it('lets an exercise keep its own name in a different case', async () => {
		const app = trainingApp();
		const [squat] = await withExercises(app, 'Squat');
		if (squat === undefined) throw new Error('setup');

		expect(expectOk(await app.renameExercise.execute({ id: squat.id, name: 'SQUAT' })).name).toBe(
			'SQUAT'
		);
	});

	it('deletes an exercise from the library but not from saved workouts that use it', async () => {
		const app = trainingApp();
		const [squat, lunge] = await withExercises(app, 'Squat', 'Lunge');
		if (squat === undefined || lunge === undefined) throw new Error('setup');
		await app.createTemplate.execute({ name: 'Legs', exerciseIds: [squat.id] });

		const inUse = expectErr(await app.deleteExercise.execute({ id: squat.id }));
		expectOk(await app.deleteExercise.execute({ id: lunge.id }));

		expect(inUse).toEqual(new ExerciseInUse(['Legs']));
		expect(names(await app.listExercises.execute())).toEqual(['Squat']);
		expect(names(await app.listRecentExercises.execute())).toEqual(['Squat']);
	});

	it('brings a deleted exercise back when one with its name is created', async () => {
		const app = trainingApp();
		const [lunge] = await withExercises(app, 'Lunge');
		if (lunge === undefined) throw new Error('setup');
		await app.deleteExercise.execute({ id: lunge.id });

		const again = expectOk(
			await app.createExercise.execute({ name: 'lunge', tracking: WEIGHT_AND_REPS })
		);

		expect(again.id).toBe(lunge.id);
		expect(names(await app.listExercises.execute())).toEqual(['Lunge']);
	});
});

describe('editing a saved workout', () => {
	it('replaces its name and exercises, keeping the target sets of those it keeps', async () => {
		const app = trainingApp();
		const [squat, lunge, calf] = await withExercises(app, 'Squat', 'Lunge', 'Calf raise');
		if (squat === undefined || lunge === undefined || calf === undefined) throw new Error('setup');
		const legs = expectOk(
			await app.createTemplate.execute({ name: 'Legs', exerciseIds: [squat.id, lunge.id] })
		);
		await app.repositories.templates.save([
			{ ...legs, exercises: [{ exerciseId: squat.id, targetSets: 5 }, ...legs.exercises.slice(1)] }
		]);

		const edited = expectOk(
			await app.editTemplate.execute({
				id: legs.id,
				name: 'Leg day',
				exerciseIds: [calf.id, squat.id]
			})
		);

		expect(edited.name).toBe('Leg day');
		expect(edited.position).toBe(legs.position);
		expect(edited.exercises).toEqual([
			{ exerciseId: calf.id, targetSets: 3 },
			{ exerciseId: squat.id, targetSets: 5 }
		]);
		expect(await app.listTemplates.execute()).toEqual([edited]);
	});

	it('refuses an empty workout or one that no longer exists', async () => {
		const app = trainingApp();
		const [squat] = await withExercises(app, 'Squat');
		if (squat === undefined) throw new Error('setup');
		const legs = expectOk(
			await app.createTemplate.execute({ name: 'Legs', exerciseIds: [squat.id] })
		);

		expect(
			expectErr(await app.editTemplate.execute({ id: legs.id, name: 'Legs', exerciseIds: [] }))
		).toBeInstanceOf(EmptyTemplate);
		expect(
			expectErr(
				await app.editTemplate.execute({
					id: anId<'WorkoutTemplate'>(),
					name: 'Legs',
					exerciseIds: [squat.id]
				})
			)
		).toBeInstanceOf(TemplateNotFound);
	});
});
