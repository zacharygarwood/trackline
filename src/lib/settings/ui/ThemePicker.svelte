<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import { Theme } from '../domain/preferences.constants.ts';
	import type { AppPreferences } from './app-preferences.svelte.ts';

	/** Props for the list of named themes, each row drawn in its own colors with a sample tracker bar. */
	interface Props {
		preferences: AppPreferences;
	}

	const { preferences }: Props = $props();
</script>

<ul class="themes" aria-label={messages.preferences.theme}>
	{#each Object.values(Theme) as theme (theme)}
		{@const chosen = preferences.current.theme === theme}
		<li>
			<button
				type="button"
				data-theme={theme}
				aria-pressed={chosen}
				onclick={() => preferences.change({ theme })}
			>
				<span class="name">{messages.preferences.themes[theme]}</span>
				<span class="bar" aria-hidden="true"><span class="fill"></span></span>
				<span class="mark" class:chosen aria-hidden="true"></span>
			</button>
		</li>
	{/each}
</ul>

<style>
	.themes {
		margin: 0 calc(-1 * var(--gutter));
	}

	button {
		display: grid;
		grid-template-columns: var(--theme-name-width) 1fr var(--theme-mark-size);
		align-items: center;
		gap: var(--space-4);
		width: 100%;
		min-height: var(--row-height);
		padding: 0 var(--gutter);
		border: none;
		border-bottom: var(--border-hairline) solid var(--color-divider);
		background: var(--color-background);
		color: var(--color-text);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-medium);
		text-align: left;
	}

	.bar {
		display: block;
		height: var(--theme-bar-height);
		background: var(--color-surface);
	}

	.fill {
		display: block;
		width: var(--theme-bar-fill);
		height: 100%;
		background: var(--color-accent);
	}

	.mark {
		width: var(--theme-mark-size);
		height: var(--theme-mark-size);
	}

	.mark.chosen {
		background: var(--color-text);
	}
</style>
