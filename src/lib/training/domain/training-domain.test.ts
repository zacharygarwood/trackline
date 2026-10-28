import { describe, expect, it } from 'vitest';
import {
	aSet,
	anExerciseId,
	aTemplateId,
	aWorkout
} from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { createExercise } from './exercise.ts';
import { InvalidName, parseName } from './name.ts';
import { prefillSets, suggestNextSet } from './set-suggestion.ts';
import { trainingStreak } from './training-streak.ts';
import { finishWorkout, NoCompletedSets, setsOf } from './workout.ts';
import {
	addExercise,
	addSet,
	ExerciseAlreadyInWorkout,
	NotInWorkout,
	removeExercise,
	removeSet,
	replaceSet,
	setNote
} from './workout-editing.ts';
import { createWorkoutSet, InvalidReps } from './workout-set.ts';

const date = (text: string) => expectOk(LocalDate.parse(text));
const squat = anExerciseId();
const bench = anExerciseId();

describe('parseName', () => {
	it('trims and collapses spaces', () => {
		expect(expectOk(parseName('  Bench   press '))).toBe('Bench press');
	});

	it.each(['', '   ', 'x'.repeat(61)])('rejects %j', (text) => {
		expect(expectErr(parseName(text))).toBeInstanceOf(InvalidName);
	});

	it('names an exercise', () => {
		expect(expectOk(createExercise({ id: squat, name: ' Squat ' })).name).toBe('Squat');
	});
});

describe('createWorkoutSet', () => {
	it.each([1, 999])('accepts %d reps', (reps) => {
		expect(expectOk(createWorkoutSet(aSet(reps, 0))).reps).toBe(reps);
	});

	it.each([0, 1000, 2.5])('rejects %d reps', (reps) => {
		expect(expectErr(createWorkoutSet(aSet(reps, 0)))).toBeInstanceOf(InvalidReps);
	});
});

describe('editing a workout', () => {
	it('adds exercises in order and refuses duplicates', () => {
		const workout = expectOk(
			addExercise(aWorkout().with(squat).active(), { exerciseId: bench, sets: [] })
		);

		expect(workout.exercises.map((exercise) => exercise.exerciseId)).toEqual([squat, bench]);
		expect(expectErr(addExercise(workout, { exerciseId: squat, sets: [] }))).toBeInstanceOf(
			ExerciseAlreadyInWorkout
		);
	});

	it('adds, replaces, and removes sets', () => {
		let workout = aWorkout().with(squat, aSet(5, 100)).active();
		workout = expectOk(addSet(workout, squat, aSet(5, 105)));
		workout = expectOk(replaceSet(workout, { exerciseId: squat, position: 0 }, aSet(5, 100, true)));
		workout = expectOk(removeSet(workout, { exerciseId: squat, position: 1 }));

		expect(setsOf(workout, squat)).toEqual([aSet(5, 100, true)]);
	});

	it('refuses to change a set that does not exist', () => {
		const workout = aWorkout().with(squat, aSet(5, 100)).active();

		expect(
			expectErr(replaceSet(workout, { exerciseId: squat, position: 3 }, aSet(1, 1)))
		).toBeInstanceOf(NotInWorkout);
		expect(expectErr(addSet(workout, bench, aSet(1, 1)))).toBeInstanceOf(NotInWorkout);
	});

	it('removes an exercise', () => {
		const workout = removeExercise(aWorkout().with(squat).with(bench).active(), squat);

		expect(workout.exercises.map((exercise) => exercise.exerciseId)).toEqual([bench]);
	});

	it('keeps a trimmed note of at most 500 characters', () => {
		expect(setNote(aWorkout().active(), '  felt strong  ').note).toBe('felt strong');
		expect(setNote(aWorkout().active(), 'x'.repeat(600)).note).toHaveLength(500);
	});
});

describe('finishWorkout', () => {
	it('keeps only completed sets and the exercises that have them', () => {
		const workout = aWorkout()
			.with(squat, aSet(5, 100, true), aSet(5, 100, false))
			.with(bench, aSet(8, 60, false))
			.active();

		const finished = expectOk(finishWorkout(workout, 1_000));

		expect(finished.exercises).toEqual([{ exerciseId: squat, sets: [aSet(5, 100, true)] }]);
		expect(finished.finishedAt).toBe(1_000);
	});

	it('refuses a workout with no completed sets', () => {
		expect(
			expectErr(finishWorkout(aWorkout().with(squat, aSet(5, 100)).active(), 1))
		).toBeInstanceOf(NoCompletedSets);
	});

	it('remembers the template it came from', () => {
		const template = aTemplateId();

		expect(aWorkout().fromTemplate(template).active().sourceTemplateId).toBe(template);
	});
});

describe('suggestNextSet', () => {
	it('copies the previous set in this workout', () => {
		expect(
			suggestNextSet({ current: [aSet(8, 60, true)], lastSession: [aSet(5, 80, true)] })
		).toEqual(aSet(8, 60));
	});

	it('uses the same set from last session for a new exercise', () => {
		const lastSession = [aSet(8, 60, true), aSet(6, 65, true)];

		expect(suggestNextSet({ current: [], lastSession })).toEqual(aSet(8, 60));
	});

	it('falls back to the last set of last session', () => {
		expect(suggestNextSet({ current: [], lastSession: [aSet(6, 65, true)] })).toEqual(aSet(6, 65));
	});

	it('suggests 10 reps at bodyweight for a brand new exercise', () => {
		expect(suggestNextSet({ current: [], lastSession: [] })).toEqual({
			reps: 10,
			weight: Mass.zero,
			completed: false
		});
	});
});

describe('prefillSets', () => {
	it('copies last session set by set', () => {
		expect(prefillSets([aSet(8, 60, true), aSet(6, 65, true)], 2)).toEqual([
			aSet(8, 60),
			aSet(6, 65)
		]);
	});

	it('repeats the last set when the template asks for more sets than last session had', () => {
		expect(prefillSets([aSet(8, 60, true)], 3)).toEqual([aSet(8, 60), aSet(8, 60), aSet(8, 60)]);
	});

	it('starts a new exercise at 10 reps of bodyweight', () => {
		expect(prefillSets([], 1)).toEqual([{ reps: 10, weight: Mass.zero, completed: false }]);
	});
});

describe('trainingStreak', () => {
	const today = date('2026-10-27');
	const days = (...texts: string[]) => texts.map(date);

	it('counts consecutive days with a workout or a rest day', () => {
		const streak = trainingStreak({
			trained: days('2026-10-25', '2026-10-27'),
			rested: days('2026-10-26'),
			today
		});

		expect(streak).toEqual({ current: 3, longest: 3 });
	});

	it('does not break the streak before today is over', () => {
		expect(
			trainingStreak({ trained: days('2026-10-25', '2026-10-26'), rested: [], today }).current
		).toBe(2);
	});

	it('breaks the streak after a missed day', () => {
		expect(
			trainingStreak({ trained: days('2026-10-24', '2026-10-25'), rested: [], today }).current
		).toBe(0);
	});

	it('remembers the longest streak', () => {
		const streak = trainingStreak({
			trained: days('2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-27'),
			rested: [],
			today
		});

		expect(streak).toEqual({ current: 1, longest: 4 });
	});

	it('counts a day with both a workout and a rest day once', () => {
		expect(
			trainingStreak({ trained: days('2026-10-27'), rested: days('2026-10-27'), today })
		).toEqual({
			current: 1,
			longest: 1
		});
	});

	it('is zero with no activity', () => {
		expect(trainingStreak({ trained: [], rested: [], today })).toEqual({ current: 0, longest: 0 });
	});
});
