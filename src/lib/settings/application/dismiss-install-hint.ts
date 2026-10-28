import type { InstallHintStore } from '../domain/app-state-repository.ts';

/** Hides the Add to Home Screen hint for good. */
export class DismissInstallHint {
	constructor(private readonly hint: InstallHintStore) {}

	/** Records the dismissal. */
	async execute(): Promise<void> {
		await this.hint.dismissInstallHint();
	}
}
