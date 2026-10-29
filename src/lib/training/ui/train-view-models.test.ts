import { describe, expect, it } from 'vitest';
import { aSet } from '../../../../tests/builders/training.builder.ts';
import { trainingApp } from '../../../../tests/support/training-app.ts';
import { first } from '../../shared/collections.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { MoveDirection } from '../domain/workout-template.ts';
import { setsOf } from '../domain/workout.ts';
import { TrainOverview } from './train-overview.svelte.ts';
import { WorkoutSession } from './workout-session.svelte.ts';

function screens() {
	const app = trainingApp();
	return { app, session: new WorkoutSession(app), overview: new TrainOverview(app, app.clock) };
}

async function logBench(session: WorkoutSession) {
	await session.start();
	await session.addExercise('Bench press');
	const benchId = first(session.workout?.exercises ?? [])?.exerciseId;
	if (benchId === undefined) throw new Error('expected an exercise');
	const location = { exerciseId: benchId, position: 0 };
	await Promise.all([
		session.setReps(location, 8),
		session.setWeight(location, 60),
		session.toggleCompleted(location)
	]);
	return { benchId, finished: await session.finish() };
}

describe('WorkoutSession', () => {
	it('logs a set in the user unit and finishes the workout', async () => {
		const { session } = screens();
		await session.load(MassUnit.kg);

		const { benchId, finished } = await logBench(session);

		expect(finished === undefined ? undefined : setsOf(finished, benchId)).toEqual([
			aSet(8, 60, true)
		]);
		expect(session.workout).toBeUndefined();
	});

	it('shows last session as a hint and names exercises', async () => {
		const { session } = screens();
		await session.load(MassUnit.kg);
		const { benchId } = await logBench(session);

		await session.start();
		await session.addExercise('bench press');

		expect(session.nameOf(benchId)).toBe('Bench press');
		expect(session.hintFor(benchId)).toBe('Last time: 8 × 60.0 kg');
	});

	it('has no hint for an exercise never done before', async () => {
		const { session } = screens();
		await session.load(MassUnit.kg);
		await session.start();
		await session.addExercise('Squat');
		const squat = session.workout?.exercises.at(0)?.exerciseId;
		if (squat === undefined) throw new Error('expected an exercise');

		expect(session.hintFor(squat)).toBeUndefined();
	});

	it('enters weights in pounds', async () => {
		const { session } = screens();
		await session.load(MassUnit.lb);
		await session.start();
		await session.addExercise('Squat');
		const squat = first(session.workout?.exercises ?? []);
		if (squat === undefined) throw new Error('expected an exercise');

		const location = { exerciseId: squat.exerciseId, position: 0 };
		await session.setReps(location, 5);
		await session.setWeight(location, 225);

		const set = first(
			session.workout === undefined ? [] : (setsOf(session.workout, squat.exerciseId) ?? [])
		);
		expect(set === undefined ? undefined : session.entryOf(set)).toEqual({
			reps: 5,
			weight: 225,
			completed: false
		});
	});

	it('explains a rejected exercise name', async () => {
		const { session } = screens();
		await session.start();

		expect(await session.addExercise(' ')).toBe('Enter a name of up to 60 characters.');
		await session.addExercise('Squat');
		expect(await session.addExercise('squat')).toBe('That exercise is already in this workout.');
	});

	it('discards a workout with nothing completed when finishing', async () => {
		const { session } = screens();
		await session.start();
		await session.addExercise('Squat');

		expect(await session.finish()).toBeUndefined();
	});
});

describe('TrainOverview', () => {
	it('saves a finished workout as a template and manages templates', async () => {
		const { session, overview } = screens();
		const { finished } = await logBench(session);
		if (finished === undefined) throw new Error('expected a finished workout');

		expect(await overview.saveAsTemplate(finished.id, 'Push')).toBeUndefined();
		expect(await overview.saveAsTemplate(finished.id, '')).toBe(
			'Enter a name of up to 60 characters.'
		);
		await overview.saveAsTemplate(finished.id, 'Upper');
		const [push, upper] = overview.templates;
		if (push === undefined || upper === undefined) throw new Error('expected two templates');

		await overview.move(upper.id, MoveDirection.up);
		await overview.rename(push.id, 'Push day');
		expect(overview.templates.map((template) => template.name)).toEqual(['Upper', 'Push day']);

		await overview.remove(upper.id);
		expect(overview.templates.map((template) => template.name)).toEqual(['Push day']);
		expect(overview.describe(finished)).toBe('Bench press · 1 set');
	});

	it('toggles a rest day and shows the streak', async () => {
		const { overview } = screens();
		await overview.load();

		await overview.toggleRestDay(overview.today, false);
		expect(overview.streakText).toBe('Streak: 1 day. Best: 1 day.');
		expect(first(overview.calendar?.days ?? [])?.rested).toBe(true);

		await overview.toggleRestDay(overview.today, true);
		expect(overview.streakText).toBe('Streak: 0 days. Best: 0 days.');
	});

	it('counts the workouts of the last seven days and tells whether today was trained or rested', async () => {
		const { session, overview } = screens();
		await overview.load();
		expect(overview.workoutsLastSevenDays).toBe(0);
		expect(overview.todayActivity).toEqual({ date: overview.today, trained: false, rested: false });

		await logBench(session);
		await overview.load();

		expect(overview.workoutsLastSevenDays).toBe(1);
		expect(overview.todayActivity?.trained).toBe(true);
	});
});

describe('WorkoutSession ordering', () => {
	it('saves a set checked off just before finishing', async () => {
		const { session } = screens();
		await session.start();
		await session.addExercise('Squat');
		const squat = first(session.workout?.exercises ?? []);
		if (squat === undefined) throw new Error('expected an exercise');
		const location = { exerciseId: squat.exerciseId, position: 0 };

		const checked = session.toggleCompleted(location);
		const finished = await session.finish();
		await checked;

		expect(finished === undefined ? undefined : setsOf(finished, squat.exerciseId)).toHaveLength(1);
	});
});
