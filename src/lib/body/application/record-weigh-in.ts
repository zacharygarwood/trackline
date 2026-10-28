import type { IdGenerator } from '../../shared/id-generator.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type { Mass } from '../../shared/mass.ts';
import type { Result } from '../../shared/result.ts';
import type { WeighInReader, WeighInWriter } from '../domain/weigh-in-repository.ts';
import { createWeighIn, type WeighIn, type WeightOutOfRange } from '../domain/weigh-in.ts';

/** What the user weighed on a day. */
export interface RecordWeighInCommand {
	readonly date: LocalDate;
	readonly weight: Mass;
}

/** Records a body weight for a day, replacing that day's earlier weigh-in if there is one. */
export class RecordWeighIn {
	constructor(
		private readonly weighIns: WeighInReader & WeighInWriter,
		private readonly ids: IdGenerator
	) {}

	/**
	 * Records the weigh-in.
	 *
	 * @param command - The day and the weight.
	 * @returns The stored weigh-in, or an error if the weight is implausible.
	 */
	async execute(command: RecordWeighInCommand): Promise<Result<WeighIn, WeightOutOfRange>> {
		const existing = await this.weighIns.findByDate(command.date);
		const result = createWeighIn({ id: existing?.id ?? this.ids.next(), ...command });
		if (result.ok) await this.weighIns.save(result.value);
		return result;
	}
}
