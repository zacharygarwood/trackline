import type {
	ExerciseId,
	WorkoutId,
	WorkoutTemplateId
} from '../../src/lib/training/domain/ids.ts';
import { WorkoutStatus } from '../../src/lib/training/domain/workout-status.constants.ts';
import {
	startWorkout,
	type ActiveWorkout,
	type FinishedWorkout,
	type WorkoutExercise
} from '../../src/lib/training/domain/workout.ts';
import type { WorkoutSet } from '../../src/lib/training/domain/workout-set.ts';
import { parseId } from '../../src/lib/shared/id.ts';
import { LocalDate } from '../../src/lib/shared/local-date.ts';
import { Mass } from '../../src/lib/shared/mass.ts';
import { expectOk } from '../support/result.ts';

let sequence = 0;

/** A fresh, valid UUIDv7 for any entity brand, unique within a test run. */
export function anId<Brand extends string>(): import('../../src/lib/shared/id.ts').Id<Brand> {
	sequence += 1;
	return expectOk(
		parseId<Brand>(`01910000-0000-7000-8000-${sequence.toString(16).padStart(12, '0')}`)
	);
}

/** An exercise id for tests. */
export const anExerciseId = (): ExerciseId => anId<'Exercise'>();

/** A template id for tests. */
export const aTemplateId = (): WorkoutTemplateId => anId<'WorkoutTemplate'>();

/** A set for tests: `aSet(8, 60)` is 8 reps at 60 kg, not yet completed. */
export function aSet(reps: number, kilograms: number, completed = false): WorkoutSet {
	return { reps, weight: expectOk(Mass.fromKg(kilograms)), completed };
}

/** Builds workouts for tests: `aWorkout().on('2026-10-27').with(exerciseId, aSet(8, 60, true)).active()`. */
export function aWorkout() {
	let id: WorkoutId = anId<'Workout'>();
	let date = '2026-10-27';
	let startedAt = 0;
	let sourceTemplateId: WorkoutTemplateId | undefined;
	const exercises: WorkoutExercise[] = [];
	const builder = {
		withId(value: WorkoutId) {
			id = value;
			return builder;
		},
		on(value: string, at = 0) {
			date = value;
			startedAt = at;
			return builder;
		},
		fromTemplate(value: WorkoutTemplateId) {
			sourceTemplateId = value;
			return builder;
		},
		with(exerciseId: ExerciseId, ...sets: WorkoutSet[]) {
			exercises.push({ exerciseId, sets });
			return builder;
		},
		active(): ActiveWorkout {
			return startWorkout({
				id,
				date: expectOk(LocalDate.parse(date)),
				startedAt,
				sourceTemplateId,
				exercises
			});
		},
		finished(finishedAt = startedAt + 3_600_000): FinishedWorkout {
			return { ...builder.active(), status: WorkoutStatus.finished, finishedAt };
		}
	};
	return builder;
}
