import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { RestDay } from '../domain/rest-day.ts';
import { TrainingTable } from './training.sql.ts';
import type { RestDayRow } from './training.row.ts';

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
