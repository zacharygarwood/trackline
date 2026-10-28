import type { SetupStatusStore } from '../domain/app-state-repository.ts';

/** Records that the user finished first-run setup. */
export class CompleteSetup {
	constructor(private readonly setup: SetupStatusStore) {}

	/** Marks setup as done. */
	async execute(): Promise<void> {
		await this.setup.markComplete();
	}
}
