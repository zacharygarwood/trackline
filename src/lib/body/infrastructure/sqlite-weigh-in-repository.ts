import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import { first } from '../../shared/collections.ts';
import type { WeighInReader, WeighInWriter } from '../domain/weigh-in-repository.ts';
import type { WeighIn, WeighInId } from '../domain/weigh-in.ts';
import { deleteWeighIn, FIND_ALL_WEIGH_INS, findWeighInByDate, saveWeighIn } from './body.sql.ts';
import { weighInMapper } from './weigh-in.mapper.ts';

/** Weigh-ins stored in the `weigh_in` table. */
export class SqliteWeighInRepository implements WeighInReader, WeighInWriter {
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc WeighInReader.findByDate} */
	async findByDate(date: LocalDate): Promise<WeighIn | undefined> {
		const row = first(await this.database.query(findWeighInByDate(date.toString())));
		return row === undefined ? undefined : requireValidRow(weighInMapper.toDomain(row));
	}

	/** {@inheritDoc WeighInReader.findAll} */
	async findAll(): Promise<readonly WeighIn[]> {
		const rows = await this.database.query(FIND_ALL_WEIGH_INS);
		return rows.map((row) => requireValidRow(weighInMapper.toDomain(row)));
	}

	/** {@inheritDoc WeighInWriter.save} */
	async save(weighIn: WeighIn): Promise<void> {
		await this.database.transaction([saveWeighIn(weighInMapper.toRow(weighIn))]);
	}

	/** {@inheritDoc WeighInWriter.delete} */
	async delete(id: WeighInId): Promise<void> {
		await this.database.execute(deleteWeighIn(id));
	}
}
