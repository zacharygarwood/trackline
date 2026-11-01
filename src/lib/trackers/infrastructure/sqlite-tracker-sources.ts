import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import type { SqlStatement } from '../../platform/db/sql.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { TrackerSources } from '../application/tracker-ports.ts';
import { Measure, type ExerciseMeasure, type MacroMeasure } from '../domain/tracker.constants.ts';
import {
	EXERCISE_SET_TOTALS,
	exerciseSessions,
	exerciseSetTotal,
	foodAmount,
	MACRO_COLUMNS,
	macroTotal,
	SOURCE_TOTAL,
	WEIGHTS,
	workoutCount
} from './tracker-sources.sql.ts';

/** Reads tracker numbers straight from the food log, workout, and weigh-in tables. */
export class SqliteTrackerSources implements TrackerSources {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc TrackerSources.macroTotal} */
	macroTotal(measure: MacroMeasure, since: LocalDate): Promise<number> {
		return this.total(macroTotal(MACRO_COLUMNS[measure], since.toString()));
	}

	/** {@inheritDoc TrackerSources.foodAmount} */
	foodAmount(foodId: string, since: LocalDate): Promise<number> {
		return this.total(foodAmount(foodId, since.toString()));
	}

	/** {@inheritDoc TrackerSources.workoutCount} */
	workoutCount(since: LocalDate): Promise<number> {
		return this.total(workoutCount(since.toString()));
	}

	/** {@inheritDoc TrackerSources.exerciseTotal} */
	exerciseTotal(exerciseId: string, measure: ExerciseMeasure, since: LocalDate): Promise<number> {
		return this.total(
			measure === Measure.sessions
				? exerciseSessions(exerciseId, since.toString())
				: exerciseSetTotal(EXERCISE_SET_TOTALS[measure], exerciseId, since.toString())
		);
	}

	/** {@inheritDoc TrackerSources.weights} */
	async weights(): Promise<readonly number[]> {
		const rows = await this.database.query(WEIGHTS);
		return rows.flatMap((row) => {
			const kilograms = row[SOURCE_TOTAL];
			return typeof kilograms === 'number' ? [kilograms] : [];
		});
	}

	private async total(statement: SqlStatement): Promise<number> {
		const value = first(await this.database.query(statement))?.[SOURCE_TOTAL];
		return typeof value === 'number' ? value : 0;
	}
}
