import { describe, expect, it } from 'vitest';
import {
	aSet,
	anExerciseId,
	aTemplateId,
	aWorkout
} from '../../../../tests/builders/training.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { InvalidName } from './name.ts';
import {
	createTemplate,
	EmptyTemplate,
	InvalidTargetSets,
	MoveDirection,
	moveTemplate,
	renameTemplate,
	templateFromWorkout,
	type WorkoutTemplate
} from './workout-template.ts';

const squat = anExerciseId();
const bench = anExerciseId();

function template(name: string, position: number): WorkoutTemplate {
	return expectOk(
		createTemplate({
			id: aTemplateId(),
			name,
			position,
			exercises: [{ exerciseId: squat, targetSets: 3 }]
		})
	);
}

describe('createTemplate', () => {
	it('rejects a template without exercises', () => {
		expect(
			expectErr(createTemplate({ id: aTemplateId(), name: 'Legs', position: 0, exercises: [] }))
		).toBeInstanceOf(EmptyTemplate);
	});

	it.each([0, 21, 1.5])('rejects %d target sets', (targetSets) => {
		const result = createTemplate({
			id: aTemplateId(),
			name: 'Legs',
			position: 0,
			exercises: [{ exerciseId: squat, targetSets }]
		});

		expect(expectErr(result)).toBeInstanceOf(InvalidTargetSets);
	});

	it('rejects an empty name', () => {
		expect(
			expectErr(
				createTemplate({
					id: aTemplateId(),
					name: ' ',
					position: 0,
					exercises: [{ exerciseId: squat, targetSets: 1 }]
				})
			)
		).toBeInstanceOf(InvalidName);
	});
});

describe('templateFromWorkout', () => {
	it('repeats the exercises with as many sets as were completed', () => {
		const workout = aWorkout()
			.with(squat, aSet(5, 100, true), aSet(5, 100, true), aSet(5, 100, true))
			.with(bench, aSet(8, 60, true))
			.finished();

		const created = expectOk(
			templateFromWorkout(workout, { id: aTemplateId(), name: 'Full body', position: 2 })
		);

		expect(created.exercises).toEqual([
			{ exerciseId: squat, targetSets: 3 },
			{ exerciseId: bench, targetSets: 1 }
		]);
		expect(created.position).toBe(2);
	});
});

describe('renameTemplate', () => {
	it('renames with a valid name', () => {
		expect(expectOk(renameTemplate(template('Legs', 0), ' Leg day ')).name).toBe('Leg day');
	});

	it('rejects an empty name', () => {
		expect(expectErr(renameTemplate(template('Legs', 0), ''))).toBeInstanceOf(InvalidName);
	});
});

describe('moveTemplate', () => {
	const a = template('A', 0);
	const b = template('B', 1);
	const c = template('C', 2);

	it('moves a template up and renumbers positions', () => {
		const moved = moveTemplate([a, b, c], c.id, MoveDirection.up);

		expect(moved.map((item) => [item.name, item.position])).toEqual([
			['A', 0],
			['C', 1],
			['B', 2]
		]);
	});

	it('does nothing when moving past either end', () => {
		expect(moveTemplate([a, b, c], a.id, MoveDirection.up).map((item) => item.name)).toEqual([
			'A',
			'B',
			'C'
		]);
		expect(moveTemplate([a, b, c], c.id, MoveDirection.down).map((item) => item.name)).toEqual([
			'A',
			'B',
			'C'
		]);
	});
});
