import type {
	WeighInReader,
	WeighInWriter
} from '../../src/lib/body/domain/weigh-in-repository.ts';
import type { WeighIn, WeighInId } from '../../src/lib/body/domain/weigh-in.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/** Weigh-ins kept in a map; passes the same contract suite as the SQLite repository. */
export class InMemoryWeighInRepository implements WeighInReader, WeighInWriter {
	private readonly weighIns = new Map<WeighInId, WeighIn>();

	findByDate(date: LocalDate): Promise<WeighIn | undefined> {
		return Promise.resolve(
			[...this.weighIns.values()].find((weighIn) => weighIn.date.equals(date))
		);
	}

	findAll(): Promise<readonly WeighIn[]> {
		return Promise.resolve(
			[...this.weighIns.values()].toSorted((a, b) => b.date.compareTo(a.date))
		);
	}

	save(weighIn: WeighIn): Promise<void> {
		const clash = [...this.weighIns.values()].find(
			(other) => other.id !== weighIn.id && other.date.equals(weighIn.date)
		);
		if (clash !== undefined)
			return Promise.reject(new Error('UNIQUE constraint failed: weigh_in.date'));
		this.weighIns.set(weighIn.id, weighIn);
		return Promise.resolve();
	}

	delete(id: WeighInId): Promise<void> {
		this.weighIns.delete(id);
		return Promise.resolve();
	}
}
