<script lang="ts">
	import Icon from './Icon.svelte';
	import { IconWeight } from './icon.constants.ts';

	/** Props for a full-width row that opens another page: a label, an optional value, and a chevron. */
	interface Props {
		label: string;
		/** Shown dimmed before the chevron, such as a count or a latest value. */
		value?: string | undefined;
		/** Opens a page by link. */
		href?: string;
		/** Opens a page from code, when it needs state passed along. */
		onclick?: () => void;
		/** The accessible name, when the text alone is not enough. */
		ariaLabel?: string | undefined;
	}

	const { label, value, href, onclick, ariaLabel }: Props = $props();
</script>

{#if href !== undefined}
	<a class="nav-row" {href} aria-label={ariaLabel}>
		<span class="label">{label}</span>
		{#if value !== undefined}<span class="value">{value}</span>{/if}
		<span class="chevron"><Icon name="forward" weight={IconWeight.medium} /></span>
	</a>
{:else}
	<button type="button" class="nav-row" aria-label={ariaLabel} {onclick}>
		<span class="label">{label}</span>
		{#if value !== undefined}<span class="value">{value}</span>{/if}
		<span class="chevron"><Icon name="forward" weight={IconWeight.medium} /></span>
	</button>
{/if}

<style>
	.nav-row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: calc(100% + 2 * var(--gutter));
		min-height: var(--row-height-tall);
		margin: 0 calc(-1 * var(--gutter));
		padding: 0 var(--gutter);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-18);
		text-align: left;
		text-decoration: none;
		--icon-size: var(--gap-18);
	}

	.nav-row:hover {
		background: var(--color-hover);
	}

	.label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.value {
		max-width: 50%;
		overflow: hidden;
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron {
		display: flex;
		color: var(--color-text-muted);
	}
</style>
