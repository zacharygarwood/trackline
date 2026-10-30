import { describe, expect, it } from 'vitest';
import { aTemplateId, anExerciseId } from '../../../../tests/builders/training.builder.ts';
import { GradeScale, TrackedField } from '../domain/tracking.constants.ts';
import { WEIGHT_AND_REPS } from '../domain/tracking.ts';
import { SessionMode } from './session-mode.constants.ts';
import {
	nextOpen,
	sessionMode,
	STOPPED,
	stopwatchSeconds,
	targetSets,
	toggleStopwatch
} from './session-rules.ts';

const bench = { id: anExerciseId(), name: 'Bench press', tracking: WEIGHT_AND_REPS };
const plank = {
	id: anExerciseId(),
	name: 'Plank',
	tracking: { fields: [TrackedField.time], grades: undefined, countLabel: undefined }
};
const boulder = {
	id: anExerciseId(),
	name: 'Bouldering',
	tracking: { fields: [TrackedField.grade], grades: { scale: GradeScale.v }, countLabel: undefined }
};

describe('sessionMode', () => {
	it('logs reps in sets, time alone as one effort, and the rest as a list', () => {
		expect([sessionMode(bench), sessionMode(plank), sessionMode(boulder)]).toEqual([
			SessionMode.sets,
			SessionMode.single,
			SessionMode.multi
		]);
	});
});

describe('targetSets', () => {
	it("aims for the template's sets, three otherwise, and none without reps", () => {
		const template = {
			id: aTemplateId(),
			name: 'Push',
			position: 0,
			exercises: [{ exerciseId: bench.id, targetSets: 5 }]
		};
		expect(targetSets(bench, template)).toBe(5);
		expect(targetSets(bench, undefined)).toBe(3);
		expect(targetSets(plank, template)).toBe(0);
	});
});

describe('nextOpen', () => {
	it('finds the next open exercise, wrapping around', () => {
		expect(nextOpen([false, true, false], 0)).toBe(2);
		expect(nextOpen([false, true, true], 2)).toBe(0);
		expect(nextOpen([true, true], 0)).toBe(-1);
		expect(nextOpen([false], -1)).toBe(0);
	});
});

describe('stopwatch', () => {
	it('runs, pauses, and resumes', () => {
		const running = toggleStopwatch(STOPPED, 1000);
		expect(stopwatchSeconds(running, 4000)).toBe(3);
		const paused = toggleStopwatch(running, 5000);
		expect(stopwatchSeconds(paused, 9000)).toBe(4);
		expect(stopwatchSeconds(toggleStopwatch(paused, 10_000), 12_000)).toBe(6);
	});
});
