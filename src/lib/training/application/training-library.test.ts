import { describe, expect, it } from 'vitest';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { trainingApp } from '../../../../tests/support/training-app.ts';
import { Mass } from '../../shared/mass.ts';
import { MoveDirection, EmptyTemplate } from '../domain/workout-template.ts';
import { type ActiveWorkout } from '../domain/workout.ts';
import { GradeScale, TrackedField } from '../domain/tracking.constants.ts';
import { InvalidTracking, WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { ExerciseExists } from './create-exercise.ts';
import { TemplateNotFound } from './start-workout.ts';

const kg = (amount: number) => expectOk(Mass.fromKg(amount));

function exerciseIdOf(workout: ActiveWorkout, position = 0) {
	const exercise = workout.exercises.at(position);
	if (exercise === undefined) throw new Error('expected an exercise');
	return exercise.exerciseId;
}

/** Logs a squat workout of the given sets, all completed, and finishes it. */
async function logSquats(
	app: ReturnType<typeof trainingApp>,
	...sets: readonly [number, number][]
) {
	await app.startWorkout.execute({ templateId: undefined });
	const workout = expectOk(await app.addExerciseToWorkout.execute({ name: 'Squat' }));
	const squat = exerciseIdOf(workout);
	for (const [reps, weight] of sets) {
		await app.logSet.execute({ exerciseId: squat, measures: { reps, weight: kg(weight) } });
	}
	return expectOk(await app.finishWorkout.execute());
}

describe('the exercise library', () => {
	it('creates an exercise with what it tracks and refuses a duplicate name', async () => {
		const app = trainingApp();
		const tracking = {
			fields: [TrackedField.grade],
			grades: { scale: GradeScale.v },
			countLabel: undefined
		} as const;

		const boulder = expectOk(await app.createExercise.execute({ name: 'Bouldering', tracking }));

		expect(boulder.tracking).toEqual(tracking);
		expect(
			expectErr(await app.createExercise.execute({ name: 'bouldering', tracking }))
		).toBeInstanceOf(ExerciseExists);
		expect(
			expectErr(
				await app.createExercise.execute({
					name: 'Nothing',
					tracking: { fields: [], grades: undefined, countLabel: undefined }
				})
			)
		).toBeInstanceOf(InvalidTracking);
	});

	it('lists new exercises first, then the most recently used', async () => {
		const app = trainingApp();
		await logSquats(app, [5, 100]);
		await app.createExercise.execute({ name: 'Plank', tracking: WEIGHT_AND_REPS });

		expect((await app.listRecentExercises.execute()).map((exercise) => exercise.name)).toEqual([
			'Plank',
			'Squat'
		]);
	});
});

describe('templates', () => {
	it('saves a finished workout as a template and starts from it with no sets yet', async () => {
		const app = trainingApp();
		const finished = await logSquats(app, [5, 100], [5, 105]);
		const template = expectOk(
			await app.saveWorkoutAsTemplate.execute({ workoutId: finished.id, name: 'Legs' })
		);

		const started = expectOk(await app.startWorkout.execute({ templateId: template.id }));

		expect(started.sourceTemplateId).toBe(template.id);
		expect(started.exercises.map((exercise) => exercise.sets)).toEqual([[]]);
	});

	it('builds a template from chosen exercises, three sets each', async () => {
		const app = trainingApp();
		await logSquats(app, [5, 100]);
		const [squat] = await app.listExercises.execute();
		if (squat === undefined) throw new Error('expected squat');

		const template = expectOk(
			await app.createTemplate.execute({ name: ' legs ', exerciseIds: [squat.id] })
		);

		expect(template).toMatchObject({ name: 'legs', position: 0 });
		expect(template.exercises).toEqual([{ exerciseId: squat.id, targetSets: 3 }]);
		expect(
			expectErr(await app.createTemplate.execute({ name: 'Empty', exerciseIds: [] }))
		).toBeInstanceOf(EmptyTemplate);
	});

	it('refuses to start from a template that is gone', async () => {
		const app = trainingApp();
		const finished = await logSquats(app, [5, 100]);
		const template = expectOk(
			await app.saveWorkoutAsTemplate.execute({ workoutId: finished.id, name: 'Legs' })
		);
		await app.deleteTemplate.execute({ id: template.id });

		expect(expectErr(await app.startWorkout.execute({ templateId: template.id }))).toBeInstanceOf(
			TemplateNotFound
		);
	});

	it('renames, reorders, and deletes templates, keeping positions contiguous', async () => {
		const app = trainingApp();
		const finished = await logSquats(app, [5, 100]);
		const names = ['A', 'B', 'C'];
		const saved = [];
		for (const name of names) {
			saved.push(
				expectOk(await app.saveWorkoutAsTemplate.execute({ workoutId: finished.id, name }))
			);
		}
		const [a, b, c] = saved;
		if (a === undefined || b === undefined || c === undefined)
			throw new Error('expected three templates');

		expectOk(await app.renameTemplate.execute({ id: a.id, name: 'Alpha' }));
		await app.moveTemplate.execute({ id: c.id, direction: MoveDirection.up });
		await app.deleteTemplate.execute({ id: b.id });

		expect(
			(await app.listTemplates.execute()).map((template) => [template.name, template.position])
		).toEqual([
			['Alpha', 0],
			['C', 1]
		]);
	});
});
