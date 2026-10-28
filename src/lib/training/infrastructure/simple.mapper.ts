import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import { createExercise, type Exercise } from '../domain/exercise.ts';
import type { RestDay } from '../domain/rest-day.ts';
import { TrainingTable } from './training.sql.ts';
import type { ExerciseRow, RestDayRow } from './training.row.ts';

/** Converts between exercises and `exercise` rows. */
export const exerciseMapper = {
	/** @param row - A row with the columns of {@link ExerciseRow}. */
	toDomain(row: SqlRow): Result<Exercise, CorruptRow> {
		const { id, name } = row;
		const exerciseId = typeof id === 'string' ? parseId<'Exercise'>(id) : undefined;
		const exercise =
			exerciseId?.ok === true && typeof name === 'string'
				? createExercise({ id: exerciseId.value, name })
				: undefined;
		return exercise?.ok === true
			? exercise
			: err(new CorruptRow(TrainingTable.exercise, CorruptReason.invalidValue));
	},

	/** @param exercise - The exercise to store. */
	toRow(exercise: Exercise): ExerciseRow {
		return { id: exercise.id, name: exercise.name };
	}
};

/** Converts between rest days and `rest_day` rows. */
export const restDayMapper = {
	/** @param row - A row with the columns of {@link RestDayRow}. */
	toDomain(row: SqlRow): Result<RestDay, CorruptRow> {
		const { id, date } = row;
		const restDayId = typeof id === 'string' ? parseId<'RestDay'>(id) : undefined;
		const day = typeof date === 'string' ? LocalDate.parse(date) : undefined;
		return restDayId?.ok === true && day?.ok === true
			? ok({ id: restDayId.value, date: day.value })
			: err(new CorruptRow(TrainingTable.restDay, CorruptReason.invalidValue));
	},

	/** @param restDay - The rest day to store. */
	toRow(restDay: RestDay): RestDayRow {
		return { id: restDay.id, date: restDay.date.toString() };
	}
};
