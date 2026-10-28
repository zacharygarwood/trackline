import type { LocalDate } from '../../shared/local-date.ts';
import type { WeighIn, WeighInId } from './weigh-in.ts';

/** Reads stored weigh-ins. */
export interface WeighInReader {
	/** The weigh-in recorded on a date, if any. */
	findByDate(date: LocalDate): Promise<WeighIn | undefined>;
	/** Every weigh-in, newest first. */
	findAll(): Promise<readonly WeighIn[]>;
}

/** Stores and removes weigh-ins. */
export interface WeighInWriter {
	/** Adds a weigh-in, or replaces the stored one with the same id. */
	save(weighIn: WeighIn): Promise<void>;
	/** Removes a weigh-in; does nothing if it doesn't exist. */
	delete(id: WeighInId): Promise<void>;
}
