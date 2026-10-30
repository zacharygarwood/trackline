<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import { Accent, Theme } from '../domain/preferences.constants.ts';
	import type { AppPreferences } from './app-preferences.svelte.ts';
	import SettingChoices from './SettingChoices.svelte';
	import SettingRow from './SettingRow.svelte';

	/** Props for the dark or light mode and the accent color. */
	interface Props {
		preferences: AppPreferences;
	}

	const { preferences }: Props = $props();
	const themes = Object.values(Theme).map((value) => ({
		value,
		label: messages.preferences.themes[value]
	}));
</script>

<h2>{messages.preferences.appearance}</h2>
<div class="group">
	<SettingRow label={messages.preferences.mode}>
		{#snippet children(labelId: string)}
			<SettingChoices
				labelledBy={labelId}
				options={themes}
				value={preferences.current.theme}
				onchoose={(theme: Theme) => preferences.change({ theme })}
			/>
		{/snippet}
	</SettingRow>
	<SettingRow label={messages.preferences.color}>
		{#snippet children(labelId: string)}
			<div class="swatches" role="group" aria-labelledby={labelId}>
				{#each Object.values(Accent) as accent (accent)}
					<button
						type="button"
						class="swatch {accent}"
						class:chosen={preferences.current.accent === accent}
						aria-pressed={preferences.current.accent === accent}
						aria-label={messages.preferences.accents[accent]}
						onclick={() => preferences.change({ accent })}
					></button>
				{/each}
			</div>
		{/snippet}
	</SettingRow>
</div>

<style>
	h2 {
		padding-bottom: var(--space-3);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.group {
		margin: 0 calc(-1 * var(--gutter)) var(--space-9);
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.swatches {
		display: flex;
		gap: var(--space-2);
	}

	.swatch {
		width: var(--swatch-size);
		height: var(--swatch-size);
		padding: 0;
		border: none;
	}

	.swatch.chosen {
		box-shadow:
			0 0 0 var(--focus-ring-width) var(--color-background),
			0 0 0 calc(2 * var(--focus-ring-width)) var(--color-text);
	}

	.sky {
		background: var(--accent-sky);
	}

	.jade {
		background: var(--accent-jade);
	}

	.clay {
		background: var(--accent-clay);
	}

	.violet {
		background: var(--accent-violet);
	}

	.rose {
		background: var(--accent-rose);
	}
</style>
