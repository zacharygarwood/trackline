import { describe, expect, it } from 'vitest';
import { anExerciseId } from '../../../../tests/builders/training.builder.ts';
import { GradeScale, TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { ExerciseForm } from './exercise-form.svelte.ts';
import { canCreateExercise, capitalized, matchExercises } from './exercise-search.ts';

const named = (name: string) => ({ id: anExerciseId(), name, tracking: WEIGHT_AND_REPS });

describe('ExerciseForm', () => {
	it('tracks the chosen fields in their usual order', () => {
		const form = new ExerciseForm();
		form.toggle(TrackedField.time);
		form.toggle(TrackedField.distance);
		form.toggle(TrackedField.count);
		form.countLabel = ' Laps ';

		expect(form.ready).toBe(true);
		expect(form.tracking).toEqual({
			fields: [TrackedField.distance, TrackedField.time, TrackedField.count],
			grades: undefined,
			countLabel: 'Laps'
		});
	});

	it('previews and keeps a grade scale, falling back for an empty custom one', () => {
		const form = new ExerciseForm();
		form.toggle(TrackedField.grade);
		expect(form.scalePreview).toBe('VB to V17');

		form.scale = GradeScale.custom;
		expect(form.tracking.grades).toEqual({ scale: GradeScale.custom, grades: ['1', '2', '3'] });
		form.customGrades = 'White, Blue,, Black';
		expect(form.scalePreview).toBe('White to Black');
	});

	it('names an untitled count, and resets', () => {
		const form = new ExerciseForm();
		form.toggle(TrackedField.count);
		expect(form.tracking.countLabel).toBe('Count');

		form.toggle(TrackedField.count);
		form.reset();
		expect(form.ready).toBe(false);
	});
});

describe('exercise search', () => {
	const recent = [named('Squat'), named('Run'), named('Bench press')];

	it('offers the recent ones, or matches A to Z', () => {
		expect(matchExercises('', recent).map((exercise) => exercise.name)).toEqual([
			'Squat',
			'Run',
			'Bench press'
		]);
		expect(matchExercises('U', recent).map((exercise) => exercise.name)).toEqual(['Run', 'Squat']);
	});

	it('offers to create a name that is new', () => {
		expect(canCreateExercise('run', recent)).toBe(false);
		expect(canCreateExercise(' Swim ', recent)).toBe(true);
		expect(canCreateExercise('  ', recent)).toBe(false);
		expect(capitalized(' swim ')).toBe('Swim');
	});
});
