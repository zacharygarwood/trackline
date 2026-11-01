<script lang="ts">
	import Icon from '../../design/Icon.svelte';
	import { IconWeight } from '../../design/icon.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import type { Template } from '../domain/template.ts';
	import { TRACKER_ICON_NAMES } from './tracker-icon.constants.ts';

	/** Props for one template to pick: its icon, name, and what it tracks. */
	interface Props {
		template: Template;
		/** Whether it is picked, for a row that toggles; undefined for a row that acts once. */
		pressed?: boolean | undefined;
		onclick: () => void;
	}

	const { template, pressed, onclick }: Props = $props();
</script>

<button
	type="button"
	class="template"
	class:picked={pressed === true}
	aria-pressed={pressed}
	{onclick}
>
	<span class="icon"
		><Icon name={TRACKER_ICON_NAMES[template.icon]} weight={IconWeight.medium} /></span
	>
	<span class="text">
		<span class="name">{messages.tracking.templates[template.key]}</span>
		<span class="hint">{messages.tracking.templateHints[template.key]}</span>
	</span>
	<span class="mark">
		{#if pressed === true}
			<Icon name="check" weight={IconWeight.bold} />
		{:else if pressed === undefined}
			<Icon name="plus" weight={IconWeight.medium} />
		{/if}
	</span>
</button>

<style>
	.template {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		width: 100%;
		min-height: var(--row-height-tall);
		padding: var(--space-3) 0;
		border: none;
		border-bottom: var(--border-hairline) solid var(--color-divider);
		background: transparent;
		color: var(--color-text);
		text-align: left;
		cursor: pointer;
	}

	.icon {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		background: var(--color-surface);
		--icon-size: var(--icon-size-medium);
	}

	.picked .icon {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.text {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.name {
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-13);
	}

	.mark {
		color: var(--color-accent);
		--icon-size: var(--icon-size-small);
	}
</style>
