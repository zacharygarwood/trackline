import type { InstallHintStore } from '../domain/app-state-repository.ts';

/** What the browser allows. */
export interface ShouldShowInstallHintCommand {
	/** True in a browser that installs apps only through Add to Home Screen, while the app isn't installed. */
	readonly canAddToHomeScreen: boolean;
}

/** Decides whether to show the hint that explains Add to Home Screen. */
export class ShouldShowInstallHint {
	constructor(private readonly hint: InstallHintStore) {}

	/** @param command - Whether the hint applies in this browser. */
	async execute(command: ShouldShowInstallHintCommand): Promise<boolean> {
		return command.canAddToHomeScreen && !(await this.hint.isInstallHintDismissed());
	}
}
