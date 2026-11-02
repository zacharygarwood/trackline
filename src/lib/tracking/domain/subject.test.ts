import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey, aTracker, aWorkoutTracker } from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import type { FieldKey, FieldValue } from './field.ts';
import { createSubject, type SubjectDraft } from './subject.ts';
import { FieldType, SubjectProblem } from './tracking.constants.ts';

const workouts = aWorkoutTracker();

function aSubjectDraft(overrides: Partial<SubjectDraft> = {}): SubjectDraft {
	return {
		id: anId<'Subject'>(),
		name: 'Squat',
		fieldKeys: [],
		defaults: new Map<FieldKey, FieldValue>(),
		...overrides
	};
}

describe('createSubject', () => {
	it('joins the library tidied, unarchived, with its fields in the tracker order', () => {
		const squat = expectOk(
			createSubject(
				workouts,
				aSubjectDraft({ name: '  Back   squat ', fieldKeys: [aKey('weight'), aKey('reps')] })
			)
		);

		expect(squat).toMatchObject({
			name: 'Back squat',
			trackerId: workouts.id,
			fieldKeys: ['reps', 'weight'],
			archived: false
		});
	});

	it('keeps default values for the fields it uses', () => {
		const defaults = new Map<FieldKey, FieldValue>([
			[aKey('reps'), { type: FieldType.number, amount: 8 }]
		]);

		expect(expectOk(createSubject(workouts, aSubjectDraft({ defaults }))).defaults).toEqual(
			defaults
		);
	});

	it.each([
		[aSubjectDraft({ name: ' ' }), SubjectProblem.name],
		[aSubjectDraft({ fieldKeys: [aKey('missing')] }), SubjectProblem.fields],
		[
			aSubjectDraft({
				defaults: new Map([[aKey('reps'), { type: FieldType.number, amount: -1 }]])
			}),
			SubjectProblem.defaults
		],
		[
			aSubjectDraft({ defaults: new Map([[aKey('missing'), { type: FieldType.check }]]) }),
			SubjectProblem.defaults
		],
		[
			aSubjectDraft({
				fieldKeys: [aKey('time')],
				defaults: new Map([[aKey('reps'), { type: FieldType.number, amount: 8 }]])
			}),
			SubjectProblem.defaults
		]
	])('rejects %o', (draft, problem) => {
		expect(expectErr(createSubject(workouts, draft)).problem).toBe(problem);
	});

	it('is only for trackers with a library', () => {
		expect(expectErr(createSubject(aTracker(), aSubjectDraft())).problem).toBe(
			SubjectProblem.notUsed
		);
	});

	it('keeps a recipe only for a food', () => {
		const recipe = { ingredients: [{ foodId: anId<'Subject'>(), servings: 1 }], servings: 2 };

		expect(expectErr(createSubject(workouts, aSubjectDraft({ recipe }))).problem).toBe(
			SubjectProblem.recipe
		);
	});

	it('takes a long name, like a food from the food database with its serving', () => {
		const name = 'Cereals, oats, regular and quick, not fortified, dry, 1 cup';

		expect(expectOk(createSubject(workouts, aSubjectDraft({ name }))).name).toBe(name);
		expect(
			expectErr(createSubject(workouts, aSubjectDraft({ name: 'x'.repeat(241) }))).problem
		).toBe(SubjectProblem.name);
	});
});
