import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { RestDayReader, RestDayWriter } from '../domain/rest-day-repository.ts';
import type { RestDay } from '../domain/rest-day.ts';
import { restDayMapper } from './simple.mapper.ts';
import {
	deleteRestDayOn,
	FIND_ALL_REST_DAYS,
	findRestDayByDate,
	insertRestDay
} from './training.sql.ts';

/** Rest days in the `rest_day` table. */
export class SqliteRestDayRepository implements RestDayReader, RestDayWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc RestDayReader.findByDate} */
	async findByDate(date: LocalDate): Promise<RestDay | undefined> {
		const row = first(await this.database.query(findRestDayByDate(date.toString())));
		return row === undefined ? undefined : requireValidRow(restDayMapper.toDomain(row));
	}

	/** {@inheritDoc RestDayReader.findAllDates} */
	async findAllDates(): Promise<readonly LocalDate[]> {
		const rows = await this.database.query(FIND_ALL_REST_DAYS);
		return rows.map((row) => requireValidRow(restDayMapper.toDomain(row)).date);
	}

	/** {@inheritDoc RestDayWriter.save} */
	async save(restDay: RestDay): Promise<void> {
		await this.database.execute(insertRestDay(restDayMapper.toRow(restDay)));
	}

	/** {@inheritDoc RestDayWriter.deleteOn} */
	async deleteOn(date: LocalDate): Promise<void> {
		await this.database.execute(deleteRestDayOn(date.toString()));
	}
}
