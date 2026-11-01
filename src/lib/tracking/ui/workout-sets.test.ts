import { describe, expect, it } from 'vitest';
import { anId } from '../../../../tests/builders/id.builder.ts';
import { aKey, anEntry, aWorkoutTracker } from '../../../../tests/builders/tracking.builder.ts';
import type { Subject } from '../domain/subject.ts';
import { FieldType } from '../domain/tracking.constants.ts';
import { groupSets, lastTimeSets, nextSetValues } from './workout-sets.ts';

const workouts = aWorkoutTracker();
const exercise = (fieldKeys: readonly string[]): Subject => ({
	id: anId<'Subject'>(),
	trackerId: workouts.id,
	name: 'Squat',
	fieldKeys: fieldKeys.map(aKey),
	defaults: new Map(),
	archived: false
});
const squat = exercise(['reps', 'weight']);
const [today, lastWeek, before] = [anId<'Session'>(), anId<'Session'>(), anId<'Session'>()];
const set = (sessionId: typeof today, loggedAt: number, reps: number, subjectId = squat.id) =>
	anEntry({
		sessionId,
		subjectId,
		loggedAt,
		values: [[aKey('reps'), { type: FieldType.number, amount: reps }]]
	});

describe('groupSets', () => {
	it('groups sets by exercise in the order the exercises started', () => {
		const bench = anId<'Subject'>();
		const sets = [set(today, 3, 5), set(today, 1, 8, bench), set(today, 2, 6)];

		expect(
			groupSets(sets).map((group) => [group.subjectId, group.sets.map((one) => one.loggedAt)])
		).toEqual([
			[bench, [1]],
			[squat.id, [2, 3]]
		]);
	});
});

describe('lastTimeSets', () => {
	it('takes the sets of the latest other workout with the exercise', () => {
		const history = [
			set(before, 1, 3),
			set(lastWeek, 10, 5),
			set(lastWeek, 11, 4),
			set(today, 20, 9)
		];

		expect(lastTimeSets(history, squat.id, today).map((one) => one.loggedAt)).toEqual([10, 11]);
		expect(lastTimeSets([], squat.id, today)).toEqual([]);
	});
});

describe('nextSetValues', () => {
	it('copies the set before, else the matching set last time', () => {
		const lastTime = [set(lastWeek, 1, 5), set(lastWeek, 2, 4)];

		expect(
			nextSetValues(workouts, squat, { current: [set(today, 3, 7)], lastTime }).get(aKey('reps'))
		).toEqual({
			type: FieldType.number,
			amount: 7
		});
		expect(nextSetValues(workouts, squat, { current: [], lastTime }).get(aKey('reps'))).toEqual({
			type: FieldType.number,
			amount: 5
		});
	});

	it('starts a first set at 10 reps and an empty bar, or a minute for a held exercise', () => {
		const first = nextSetValues(workouts, squat, { current: [], lastTime: [] });
		const plank = nextSetValues(workouts, exercise(['time']), { current: [], lastTime: [] });

		expect([...first.values()]).toEqual([
			{ type: FieldType.number, amount: 10 },
			{ type: FieldType.number, amount: 0 }
		]);
		expect([...plank.values()]).toEqual([{ type: FieldType.duration, seconds: 60 }]);
	});
});
