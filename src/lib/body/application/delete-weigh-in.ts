import type { WeighInWriter } from '../domain/weigh-in-repository.ts';
import type { WeighInId } from '../domain/weigh-in.ts';

/** Which weigh-in to remove. */
export interface DeleteWeighInCommand {
	readonly id: WeighInId;
}

/** Removes one weigh-in. */
export class DeleteWeighIn {
	constructor(private readonly weighIns: WeighInWriter) {}

	/** @param command - The weigh-in to remove. */
	async execute(command: DeleteWeighInCommand): Promise<void> {
		await this.weighIns.delete(command.id);
	}
}
