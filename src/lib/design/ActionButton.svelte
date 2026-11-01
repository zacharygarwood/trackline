<script lang="ts">
	import Icon from './Icon.svelte';
	import { IconWeight, type IconName } from './icon.constants.ts';

	/** Props for a page's main action: an outlined square with an icon and a label, never filled like a tracker bar. */
	interface Props {
		label: string;
		icon: IconName;
		/** Opens a page by link. */
		href?: string;
		/** Runs an action, when there is no link. */
		onclick?: () => void;
	}

	const { label, icon, href, onclick }: Props = $props();
</script>

{#if href !== undefined}
	<a class="action" {href}
		><span class="icon"><Icon name={icon} weight={IconWeight.bold} /></span>{label}</a
	>
{:else}
	<button type="button" class="action" {onclick}
		><span class="icon"><Icon name={icon} weight={IconWeight.bold} /></span>{label}</button
	>
{/if}

<style>
	.action {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--button-height);
		padding: 0 var(--space-4);
		border: var(--border-field) solid var(--color-text);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
		text-align: left;
		text-decoration: none;
	}

	.action:hover {
		background: var(--color-hover);
	}

	.icon {
		display: flex;
		color: var(--color-accent);
		--icon-size: var(--icon-size-small);
	}
</style>
