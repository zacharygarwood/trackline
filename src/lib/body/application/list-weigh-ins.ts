import type { WeighInReader } from '../domain/weigh-in-repository.ts';
import type { WeighIn } from '../domain/weigh-in.ts';

/** Lists every weigh-in for the history and the weight graph. */
export class ListWeighIns {
	constructor(private readonly weighIns: WeighInReader) {}

	/** @returns Every weigh-in, newest first. */
	execute(): Promise<readonly WeighIn[]> {
		return this.weighIns.findAll();
	}
}
