<script lang="ts">
	import ProgressBody from './ProgressBody.svelte';

	/** Props for one quiet line of progress: a label and its numbers over a thin bar, optionally opening a page. */
	interface Props {
		label: string;
		/** The number so far, such as "811". */
		value: string;
		/** Shown dimmed after the value, such as "/ 2,200 kcal". */
		detail?: string | undefined;
		/** How far along, from 0 to 1; without it a hint shows instead of the bar. */
		fraction?: number | undefined;
		/** Shown under the numbers when there is no bar, such as "Set a goal in Settings". */
		hint?: string | undefined;
		/** Opens this page when tapped. */
		href?: string | undefined;
		/** Runs when tapped, for a row that acts instead of opening a page. */
		onclick?: (() => void) | undefined;
		/** The accessible name of a row with `onclick`. */
		ariaLabel?: string | undefined;
	}

	const { label, value, detail, fraction, hint, href, onclick, ariaLabel }: Props = $props();
</script>

{#if onclick !== undefined}
	<button type="button" class="progress-row" aria-label={ariaLabel} {onclick}
		><ProgressBody {label} {value} {detail} {fraction} {hint} /></button
	>
{:else if href === undefined}
	<div class="progress-row"><ProgressBody {label} {value} {detail} {fraction} {hint} /></div>
{:else}
	<a class="progress-row" {href}><ProgressBody {label} {value} {detail} {fraction} {hint} /></a>
{/if}

<style>
	.progress-row {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--progress-row-padding) var(--gutter);
		color: var(--color-text);
		text-decoration: none;
	}

	button.progress-row {
		width: calc(100% + 2 * var(--gutter));
		border: none;
		background: transparent;
		font: inherit;
		text-align: left;
	}

	a.progress-row:hover,
	button.progress-row:hover {
		background: var(--color-hover);
	}
</style>
