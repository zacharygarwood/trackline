import type { SetupStatusStore } from '../domain/app-state-repository.ts';

/** Whether the first-run screen still needs to be shown. */
export class GetSetupStatus {
	constructor(private readonly setup: SetupStatusStore) {}

	/** @returns True once the user has finished first-run setup. */
	execute(): Promise<boolean> {
		return this.setup.isComplete();
	}
}
