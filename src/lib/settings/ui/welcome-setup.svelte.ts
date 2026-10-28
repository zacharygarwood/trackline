import type { CompleteSetup } from '../application/complete-setup.ts';

/** One part of first-run setup: saves what the user filled in, or returns why it can't. */
export type SetupStep = () => Promise<string | undefined>;

/** State and action of the first-run screen's single Get started button. */
export class WelcomeSetup {
	problem: string | undefined = $state();

	constructor(private readonly completeSetup: CompleteSetup) {}

	/**
	 * Saves each step in order and finishes setup. Stops at the first problem
	 * so the user can fix it without leaving the screen.
	 *
	 * @param steps - The parts of the screen to save.
	 * @returns Whether setup finished.
	 */
	async finish(steps: readonly SetupStep[]): Promise<boolean> {
		for (const step of steps) {
			this.problem = await step();
			if (this.problem !== undefined) return false;
		}
		await this.completeSetup.execute();
		return true;
	}
}
