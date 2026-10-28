import { ok, type Result } from '../../shared/result.ts';
import { setNote } from '../domain/workout-editing.ts';
import type { ActiveWorkout } from '../domain/workout.ts';
import { changeActiveWorkout, type NoActiveWorkout } from './active-workout.ts';
import type { Workouts } from './training-ports.ts';

/** The note's new text. */
export interface SetWorkoutNoteCommand {
	readonly note: string;
}

/** Saves the note on the workout in progress. */
export class SetWorkoutNote {
	constructor(private readonly workouts: Workouts) {}

	/** @param command - The note. */
	execute(command: SetWorkoutNoteCommand): Promise<Result<ActiveWorkout, NoActiveWorkout>> {
		return changeActiveWorkout(this.workouts, (workout) => ok(setNote(workout, command.note)));
	}
}
