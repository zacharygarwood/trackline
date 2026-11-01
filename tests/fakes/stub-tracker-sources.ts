import type { TrackerSources } from '../../src/lib/trackers/application/tracker-ports.ts';
import type {
	ExerciseMeasure,
	MacroMeasure
} from '../../src/lib/trackers/domain/tracker.constants.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/** Fixed numbers for the food log, workouts, and weigh-ins, recording what was asked. */
export class StubTrackerSources implements TrackerSources {
	readonly calls: string[] = [];
	macros: Partial<Record<MacroMeasure, number>> = {};
	food = 0;
	workouts = 0;
	exercise = 0;
	weighIns: readonly number[] = [];

	macroTotal(measure: MacroMeasure, since: LocalDate): Promise<number> {
		this.calls.push(`${measure} since ${since.toString()}`);
		return Promise.resolve(this.macros[measure] ?? 0);
	}

	foodAmount(foodId: string, since: LocalDate): Promise<number> {
		this.calls.push(`food ${foodId} since ${since.toString()}`);
		return Promise.resolve(this.food);
	}

	workoutCount(since: LocalDate): Promise<number> {
		this.calls.push(`workouts since ${since.toString()}`);
		return Promise.resolve(this.workouts);
	}

	exerciseTotal(exerciseId: string, measure: ExerciseMeasure, since: LocalDate): Promise<number> {
		this.calls.push(`${measure} of ${exerciseId} since ${since.toString()}`);
		return Promise.resolve(this.exercise);
	}

	weights(): Promise<readonly number[]> {
		return Promise.resolve(this.weighIns);
	}
}
