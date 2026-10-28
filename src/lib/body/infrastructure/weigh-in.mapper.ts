import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { err, type Result } from '../../shared/result.ts';
import { createWeighIn, type WeighIn } from '../domain/weigh-in.ts';
import { BodyTable } from './body.sql.ts';
import type { WeighInRow } from './weigh-in.row.ts';

const corrupt = (reason: string) => err(new CorruptRow(BodyTable.weighIn, reason));

/** Converts between weigh-ins and `weigh_in` rows. */
export const weighInMapper = {
	/**
	 * Validates a stored row and builds the weigh-in it describes.
	 *
	 * @param row - A row selected with the columns of {@link WeighInRow}.
	 */
	toDomain(row: SqlRow): Result<WeighIn, CorruptRow> {
		const { id, date, weight_kg } = row;
		if (typeof id !== 'string' || typeof date !== 'string' || typeof weight_kg !== 'number') {
			return corrupt(CorruptReason.missingColumn);
		}
		const parsedId = parseId<'WeighIn'>(id);
		const parsedDate = LocalDate.parse(date);
		const weight = Mass.fromKg(weight_kg);
		if (!parsedId.ok || !parsedDate.ok || !weight.ok) return corrupt(CorruptReason.invalidValue);
		const weighIn = createWeighIn({
			id: parsedId.value,
			date: parsedDate.value,
			weight: weight.value
		});
		return weighIn.ok ? weighIn : corrupt(CorruptReason.brokenInvariant);
	},

	/** @param weighIn - The weigh-in to store. */
	toRow(weighIn: WeighIn): WeighInRow {
		return { id: weighIn.id, date: weighIn.date.toString(), weight_kg: weighIn.weight.kilograms };
	}
};
