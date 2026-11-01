import { describe, expect, it } from 'vitest';
import { expectOk } from '../../../../tests/support/result.ts';
import { trainingApp } from '../../../../tests/support/training-app.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { ExerciseEditor } from './exercise-editor.svelte.ts';
import { WorkoutBuilder } from './workout-builder.svelte.ts';

async function withExercises(app: ReturnType<typeof trainingApp>, ...names: string[]) {
	const created = [];
	for (const name of names) {
		created.push(expectOk(await app.createExercise.execute({ name, tracking: WEIGHT_AND_REPS })));
	}
	return created;
}

describe('ExerciseEditor', () => {
	it('renames an exercise and explains a clash', async () => {
		const app = trainingApp();
		const [squat] = await withExercises(app, 'Squat', 'Lunge');
		if (squat === undefined) throw new Error('setup');
		const editor = new ExerciseEditor(app, squat);

		editor.name = 'lunge';
		expect(await editor.rename()).toBe(false);
		expect(editor.problem).toBeDefined();
		editor.name = 'Back squat';
		expect(await editor.rename()).toBe(true);
		expect(editor.problem).toBeUndefined();
	});

	it('deletes an exercise unless a saved workout uses it', async () => {
		const app = trainingApp();
		const [squat, lunge] = await withExercises(app, 'Squat', 'Lunge');
		if (squat === undefined || lunge === undefined) throw new Error('setup');
		await app.createTemplate.execute({ name: 'Legs', exerciseIds: [squat.id] });

		expect(await new ExerciseEditor(app, squat).delete()).toBe(false);
		expect(await new ExerciseEditor(app, lunge).delete()).toBe(true);
		expect((await app.listExercises.execute()).map((exercise) => exercise.name)).toEqual(['Squat']);
	});
});

describe('WorkoutBuilder editing a saved workout', () => {
	it('starts with its name and exercises and saves the changes in place', async () => {
		const app = trainingApp();
		const [squat, lunge] = await withExercises(app, 'Squat', 'Lunge');
		if (squat === undefined || lunge === undefined) throw new Error('setup');
		const legs = expectOk(
			await app.createTemplate.execute({ name: 'Legs', exerciseIds: [squat.id] })
		);
		const builder = new WorkoutBuilder(app, legs);
		await builder.load();

		expect([builder.name, builder.chosen.map((exercise) => exercise.name)]).toEqual([
			'Legs',
			['Squat']
		]);
		builder.add(lunge);
		expect(await builder.save()).toBe('Legs');
		expect(
			(await app.listTemplates.execute()).map((template) => template.exercises.length)
		).toEqual([2]);
	});
});
