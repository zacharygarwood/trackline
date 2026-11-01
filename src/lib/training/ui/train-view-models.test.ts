import { describe, expect, it } from 'vitest';
import { trainingApp } from '../../../../tests/support/training-app.ts';
import { DistanceUnit } from '../../shared/distance-unit.constants.ts';
import { MassUnit } from '../../shared/mass-unit.constants.ts';
import { WeekStart } from '../../shared/week-start.constants.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { TrainOverview } from './train-overview.svelte.ts';
import { TrainScreen } from './train-screen.svelte.ts';
import { WeekDayState } from './week-strip.constants.ts';
import { WorkoutBuilder } from './workout-builder.svelte.ts';
import { WorkoutSession } from './workout-session.svelte.ts';

const preferences = () => ({
	units: { mass: MassUnit.lb, distance: DistanceUnit.mi },
	restSeconds: 90
});

function screens() {
	const app = trainingApp();
	return {
		app,
		train: new TrainScreen(app),
		builder: new WorkoutBuilder(app),
		session: new WorkoutSession(app, app.clock, preferences),
		overview: new TrainOverview(app, app.clock)
	};
}

async function withBench(app: ReturnType<typeof trainingApp>) {
	const bench = await app.createExercise.execute({
		name: 'Bench press',
		tracking: WEIGHT_AND_REPS
	});
	if (!bench.ok) throw new Error('expected bench press');
	return bench.value;
}

describe('TrainScreen', () => {
	it('starts a workout of one exercise and adds more to it', async () => {
		const { app, train } = screens();
		const bench = await withBench(app);
		await train.load();

		await train.startExercise(bench);
		await train.load();
		train.query = 'squat';
		expect(train.canCreate).toBe(true);
		expect(await train.create(WEIGHT_AND_REPS)).toBe('Squat');

		expect(train.activeName).toBe('Bench press');
		expect(train.query).toBe('');
		expect(train.matches.map((exercise) => exercise.name)).toEqual(['Squat', 'Bench press']);
	});

	it('starts a saved workout, or adds its exercises to the one in progress', async () => {
		const { app, train, builder } = screens();
		const bench = await withBench(app);
		await builder.load();
		builder.name = 'push day';
		builder.add(bench);
		expect(await builder.save()).toBe('Push day');
		await train.load();
		const [push] = train.visibleTemplates;
		if (push === undefined) throw new Error('expected a template');

		await train.startTemplate(push);
		await train.load();

		expect(train.activeName).toBe('Push day');
		expect(train.active?.exercises).toHaveLength(1);
	});

	it('finds the saved workout a page was opened with, and names its exercises', async () => {
		const { app, train, builder } = screens();
		const bench = await withBench(app);
		await builder.load();
		builder.name = 'Push day';
		builder.add(bench);
		await builder.save();
		await train.load();
		const [push] = train.visibleTemplates;

		const found = train.findTemplate(push?.id);

		expect(found).toBe(push);
		expect(found === undefined ? [] : train.exerciseNames(found)).toEqual(['Bench press']);
		expect(train.findTemplate('unknown')).toBeUndefined();
	});
});

describe('WorkoutBuilder', () => {
	it('needs a name and an exercise, and can create an exercise on the way', async () => {
		const { builder } = screens();
		await builder.load();
		builder.name = 'Climbing';
		expect(builder.canSave).toBe(false);

		builder.query = 'boulder';
		await builder.create({
			fields: [TrackedField.grade],
			grades: { scale: 'v' },
			countLabel: undefined
		});

		expect(builder.chosen.map((exercise) => exercise.name)).toEqual(['Boulder']);
		expect(builder.canSave).toBe(true);
		builder.remove(0);
		expect(builder.canSave).toBe(false);
	});
});

describe('WorkoutSession', () => {
	it('logs sets from the steppers, moves on after three, and rests in between', async () => {
		const { app, train, session } = screens();
		const bench = await withBench(app);
		await train.startExercise(bench);
		await session.load();
		session.step(bench.id, 'weight', 1);
		session.type(bench.id, 'reps', '8');

		expect(await session.logCurrent()).toBe('5 × 8 logged');
		expect(session.rest.left(app.clock.now())).toBe(90);
		await session.logCurrent();
		await session.logCurrent();

		expect(
			session.workout?.exercises.find((entry) => entry.exerciseId === bench.id)?.sets
		).toHaveLength(3);
		expect(session.current).toBe(-1);
		expect(session.rest.running).toBe(false);
	});

	it('times an effort and logs it when done early', async () => {
		const { app, session } = screens();
		const plank = await app.createExercise.execute({
			name: 'Plank',
			tracking: { fields: [TrackedField.time], grades: undefined, countLabel: undefined }
		});
		if (!plank.ok) throw new Error('expected plank');
		await app.startWorkout.execute({ templateId: undefined });
		await app.addExerciseToWorkout.execute({ name: 'Plank' });
		await session.load();

		session.toggleStopwatch(plank.value.id);
		app.clock.advance(65_000);
		expect(await session.doneWithCurrent()).toBe('Plank done');

		expect(
			session.workout?.exercises.find((entry) => entry.exerciseId === plank.value.id)?.sets
		).toEqual([
			{
				seconds: 65,
				completed: true,
				weight: undefined,
				reps: undefined,
				grade: undefined,
				distance: undefined,
				count: undefined
			}
		]);
	});

	it('finishes with Undo, and discards with Undo', async () => {
		const { app, train, session } = screens();
		const bench = await withBench(app);
		await train.startExercise(bench);
		await session.load();
		await session.logCurrent();

		const finished = await session.finish();
		expect(finished.saved).toBe(true);
		if (finished.before === undefined) throw new Error('expected the workout');
		await session.restore(finished.before);
		expect(await app.getActiveWorkout.execute()).toEqual(finished.before);

		const discarded = await session.discard();
		expect(await app.getActiveWorkout.execute()).toBeUndefined();
		expect(discarded?.id).toBe(finished.before.id);
	});
});

describe('TrainOverview', () => {
	it("shows this week's workouts and sums up finished ones, and saves them", async () => {
		const { app, train, session, overview } = screens();
		const bench = await withBench(app);
		await train.startExercise(bench);
		await session.load();
		await session.logCurrent();
		app.clock.advance(1_800_000);
		await session.finish();
		await overview.load();
		const [workout] = overview.recent;
		if (workout === undefined) throw new Error('expected a workout');

		const today = overview
			.thisWeek(WeekStart.monday)
			.find((day) => day.date.equals(app.clock.today()));
		expect(today?.state).toBe(WeekDayState.trained);
		expect(overview.nameOf(workout)).toBe('Bench press');
		expect(overview.summaryOf(workout, preferences().units).map((row) => row.value)).toEqual([
			'30:00',
			'1 × 10 at 0 lb'
		]);
		expect(overview.canSave(workout)).toBe(true);
		expect(await overview.save(workout)).toBe(true);
		expect(overview.canSave(workout)).toBe(false);
	});
});
