import { describe, expect, it } from 'vitest';
import {
	aField,
	aKey,
	aNumberField,
	aTrackerDraft
} from '../../../../tests/builders/tracking.builder.ts';
import { expectErr, expectOk } from '../../../../tests/support/result.ts';
import { daysAWeek } from './goal-parts.ts';
import { createTracker, fieldOf } from './tracker.ts';
import {
	FieldProblem,
	FieldType,
	GoalType,
	TrackerKind,
	TrackerProblem
} from './tracking.constants.ts';

describe('createTracker', () => {
	it('tidies the name and checks each field', () => {
		const water = expectOk(
			createTracker(
				aTrackerDraft({ name: '  Drink   water ', fields: [aNumberField({ label: ' Glasses ' })] })
			)
		);

		expect(water.name).toBe('Drink water');
		expect(fieldOf(water, aKey('amount'))?.label).toBe('Glasses');
		expect(fieldOf(water, aKey('missing'))).toBeUndefined();
	});

	it.each([
		[{ name: ' ' }, TrackerProblem.name],
		[{ name: 'x'.repeat(41) }, TrackerProblem.name],
		[{ fields: [] }, TrackerProblem.noFields],
		[
			{ fields: Array.from({ length: 9 }, (_, index) => aField({ key: `f${String(index)}` })) },
			TrackerProblem.tooManyFields
		],
		[{ fields: [aNumberField(), aNumberField()] }, TrackerProblem.duplicateField],
		[{ fields: [aNumberField({ label: '' })] }, FieldProblem.label],
		[{ fields: [aField()] }, TrackerProblem.goal],
		[{ kind: TrackerKind.photos }, TrackerProblem.missingField],
		[
			{ kind: TrackerKind.food, fields: [aField()], goal: daysAWeek(1) },
			TrackerProblem.missingField
		]
	])('rejects %o', (change, problem) => {
		expect(expectErr(createTracker(aTrackerDraft(change))).problem).toBe(problem);
	});

	it('takes a photo tracker that has a photo field', () => {
		const photos = aTrackerDraft({
			kind: TrackerKind.photos,
			fields: [aField({ type: FieldType.photo, key: 'photo', required: true })],
			goal: daysAWeek(1)
		});

		expect(expectOk(createTracker(photos)).kind).toBe(TrackerKind.photos);
	});

	it('names the field at fault', () => {
		const tracker = aTrackerDraft({ fields: [aNumberField(), aNumberField({ key: 'Bad key' })] });

		expect(expectErr(createTracker(tracker))).toMatchObject({
			problem: FieldProblem.key,
			field: 'Bad key'
		});
	});

	it('takes a target goal on a number field', () => {
		const weight = aTrackerDraft({
			goal: { type: GoalType.target, field: aKey('amount'), target: 70 }
		});

		expect(expectOk(createTracker(weight)).goal.type).toBe(GoalType.target);
	});
});
