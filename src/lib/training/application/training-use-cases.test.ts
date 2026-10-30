import { describe, expect, it } from 'vitest';
import { aSet } from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { trainingApp } from '../../../../tests/support/training-app.ts';
import { Mass } from '../../shared/mass.ts';
import { first } from '../../shared/collections.ts';
import { InvalidName } from '../domain/name.ts';
import { DayHasWorkout } from '../domain/rest-day.ts';
import { ExerciseAlreadyInWorkout, NotInWorkout } from '../domain/workout-editing.ts';
import { NoCompletedSets, setsOf, type ActiveWorkout } from '../domain/workout.ts';
import { EmptySet, InvalidReps } from '../domain/workout-set.ts';
import { TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { OtherWorkoutInProgress } from './restore-workout.ts';
import { Distance } from '../../shared/distance.ts';
import { NoActiveWorkout } from './active-workout.ts';

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

describe('starting and editing a workout', () => {
	it('starts an empty workout today and resumes it instead of starting another', async () => {
		const app = trainingApp();

		const started = expectOk(await app.startWorkout.execute({ templateId: undefined }));
		const again = expectOk(await app.startWorkout.execute({ templateId: undefined }));

		expect(started.date.toString()).toBe('2026-10-27');
		expect(again.id).toBe(started.id);
	});

	it('adds a new exercise to the library and the workout, tracking weight and reps, with no sets yet', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });

		const workout = expectOk(await app.addExerciseToWorkout.execute({ name: ' bench  press ' }));

		expect((await app.listExercises.execute()).map((exercise) => exercise.name)).toEqual([
			'bench press'
		]);
		expect(setsOf(workout, exerciseIdOf(workout))).toEqual([]);
		expect((await app.listExercises.execute()).at(0)?.tracking).toEqual(WEIGHT_AND_REPS);
	});

	it('reuses an existing exercise whatever the case, and refuses it twice', async () => {
		const app = trainingApp();
		await logSquats(app, [5, 100]);
		await app.startWorkout.execute({ templateId: undefined });
		await app.addExerciseToWorkout.execute({ name: 'SQUAT' });

		expect(await app.listExercises.execute()).toHaveLength(1);
		expect(expectErr(await app.addExerciseToWorkout.execute({ name: 'squat' }))).toBeInstanceOf(
			ExerciseAlreadyInWorkout
		);
	});

	it('rejects an empty exercise name', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });

		expect(expectErr(await app.addExerciseToWorkout.execute({ name: '  ' }))).toBeInstanceOf(
			InvalidName
		);
	});

	it('needs a workout in progress to add exercises', async () => {
		expect(
			expectErr(await trainingApp().addExerciseToWorkout.execute({ name: 'Squat' }))
		).toBeInstanceOf(NoActiveWorkout);
	});

	it('logs completed sets in order, and shows last session', async () => {
		const app = trainingApp();
		await logSquats(app, [5, 100], [5, 105]);
		await app.startWorkout.execute({ templateId: undefined });
		const squat = exerciseIdOf(expectOk(await app.addExerciseToWorkout.execute({ name: 'Squat' })));

		const workout = expectOk(
			await app.logSet.execute({ exerciseId: squat, measures: { reps: 6, weight: kg(102.5) } })
		);

		expect(setsOf(workout, squat)).toEqual([aSet(6, 102.5, true)]);
		expect(await app.getLastPerformance.execute({ exerciseId: squat })).toEqual([
			aSet(5, 100, true),
			aSet(5, 105, true)
		]);
	});

	it('logs a timed effort with a distance', async () => {
		const app = trainingApp();
		const run = expectOk(
			await app.createExercise.execute({
				name: 'Run',
				tracking: {
					fields: [TrackedField.time, TrackedField.distance],
					grades: undefined,
					countLabel: undefined
				}
			})
		);
		await app.startWorkout.execute({ templateId: undefined });
		await app.addExerciseToWorkout.execute({ name: 'run' });

		const workout = expectOk(
			await app.logSet.execute({
				exerciseId: run.id,
				measures: { seconds: 1960, distance: expectOk(Distance.fromMeters(5470)) }
			})
		);

		expect(setsOf(workout, run.id)?.at(0)).toMatchObject({ seconds: 1960, completed: true });
	});

	it('rejects impossible sets and missing sets', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });
		const squat = exerciseIdOf(expectOk(await app.addExerciseToWorkout.execute({ name: 'Squat' })));

		const zeroReps = await app.logSet.execute({ exerciseId: squat, measures: { reps: 0 } });
		const empty = await app.logSet.execute({ exerciseId: squat, measures: {} });
		const missing = await app.removeSet.execute({ location: { exerciseId: squat, position: 4 } });

		expect(expectErr(zeroReps)).toBeInstanceOf(InvalidReps);
		expect(expectErr(empty)).toBeInstanceOf(EmptySet);
		expect(expectErr(missing)).toBeInstanceOf(NotInWorkout);
	});

	it('removes sets and exercises, and keeps a note', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });
		const squat = exerciseIdOf(expectOk(await app.addExerciseToWorkout.execute({ name: 'Squat' })));
		await app.logSet.execute({ exerciseId: squat, measures: { reps: 5 } });
		await app.logSet.execute({ exerciseId: squat, measures: { reps: 5 } });
		const afterRemoval = expectOk(
			await app.removeSet.execute({ location: { exerciseId: squat, position: 0 } })
		);
		expect(setsOf(afterRemoval, squat)).toHaveLength(1);

		await app.removeExerciseFromWorkout.execute({ exerciseId: squat });
		const workout = expectOk(await app.setWorkoutNote.execute({ note: 'Short session' }));

		expect(workout.exercises).toEqual([]);
		expect(workout.note).toBe('Short session');
	});
});

describe('finishing a workout', () => {
	it('keeps completed sets and lists the workout as recent', async () => {
		const app = trainingApp();

		const finished = await logSquats(app, [5, 100]);

		expect(await app.getActiveWorkout.execute()).toBeUndefined();
		expect(
			(await app.listRecentWorkouts.execute({ limit: 5 })).map((workout) => workout.id)
		).toEqual([finished.id]);
	});

	it('discards a workout with nothing completed', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });
		await app.addExerciseToWorkout.execute({ name: 'Squat' });

		expect(expectErr(await app.finishWorkout.execute())).toBeInstanceOf(NoCompletedSets);
		expect(await app.getActiveWorkout.execute()).toBeUndefined();
		expect(await app.listRecentWorkouts.execute({ limit: 5 })).toEqual([]);
	});

	it('can be thrown away while in progress', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });

		await app.discardWorkout.execute();

		expect(await app.getActiveWorkout.execute()).toBeUndefined();
	});

	it('needs a workout in progress', async () => {
		expect(expectErr(await trainingApp().finishWorkout.execute())).toBeInstanceOf(NoActiveWorkout);
	});

	it('brings a finished or discarded workout back as it was', async () => {
		const app = trainingApp();
		await app.startWorkout.execute({ templateId: undefined });
		const before = expectOk(await app.addExerciseToWorkout.execute({ name: 'Squat' }));
		const logged = expectOk(
			await app.logSet.execute({ exerciseId: exerciseIdOf(before), measures: { reps: 5 } })
		);
		await app.finishWorkout.execute();

		expectOk(await app.restoreWorkout.execute({ workout: logged }));

		expect(await app.getActiveWorkout.execute()).toEqual(logged);
		expect(await app.listRecentWorkouts.execute({ limit: 5 })).toEqual([]);
	});

	it('refuses to bring a workout back over another in progress', async () => {
		const app = trainingApp();
		const old = expectOk(await app.startWorkout.execute({ templateId: undefined }));
		await app.discardWorkout.execute();
		await app.startWorkout.execute({ templateId: undefined });

		expect(expectErr(await app.restoreWorkout.execute({ workout: old }))).toBeInstanceOf(
			OtherWorkoutInProgress
		);
	});
});

describe('rest days and streaks', () => {
	it('marks today as a rest day, which keeps the streak going, and removes it in one step', async () => {
		const app = trainingApp();
		app.clock.setToday('2026-10-26');
		await logSquats(app, [5, 100]);
		app.clock.setToday('2026-10-27');

		expectOk(await app.markRestDay.execute({ date: app.clock.today() }));
		const calendar = await app.getTrainingDays.execute({ days: 2 });

		expect(calendar.streak).toEqual({ current: 2, longest: 2 });
		expect(first(calendar.days)).toEqual({ date: app.clock.today(), trained: false, rested: true });

		await app.removeRestDay.execute({ date: app.clock.today() });
		expect((await app.getTrainingDays.execute({ days: 1 })).days).toEqual([
			{ date: app.clock.today(), trained: false, rested: false }
		]);
	});

	it('refuses a rest day on a day with a workout', async () => {
		const app = trainingApp();
		await logSquats(app, [5, 100]);

		expect(expectErr(await app.markRestDay.execute({ date: app.clock.today() }))).toBeInstanceOf(
			DayHasWorkout
		);
	});

	it('replaces a rest day when a workout is logged that day', async () => {
		const app = trainingApp();
		await app.markRestDay.execute({ date: app.clock.today() });

		await logSquats(app, [5, 100]);

		expect(await app.repositories.restDays.findByDate(app.clock.today())).toBeUndefined();
		expect(first((await app.getTrainingDays.execute({ days: 1 })).days)?.trained).toBe(true);
	});
});
