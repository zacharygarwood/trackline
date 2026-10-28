import { describe, expect, it } from 'vitest';
import { InMemoryAppState } from '../../../../tests/fakes/in-memory-app-state.ts';
import { DismissInstallHint } from './dismiss-install-hint.ts';
import { ShouldShowInstallHint } from './should-show-install-hint.ts';

describe('install hint use cases', () => {
	it('shows the hint where the app can be added to the home screen, until dismissed', async () => {
		const state = new InMemoryAppState();
		const shouldShow = new ShouldShowInstallHint(state);

		expect(await shouldShow.execute({ canAddToHomeScreen: true })).toBe(true);
		await new DismissInstallHint(state).execute();
		expect(await shouldShow.execute({ canAddToHomeScreen: true })).toBe(false);
	});

	it('never shows the hint where the app is installed or can install itself', async () => {
		expect(
			await new ShouldShowInstallHint(new InMemoryAppState()).execute({ canAddToHomeScreen: false })
		).toBe(false);
	});
});
