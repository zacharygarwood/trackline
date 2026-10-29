<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for a full-width section of a screen: a small label, then its rows, then a divider. */
	interface Props {
		/** The section's label. */
		title?: string;
		/** Shown at the end of the label row, such as a total or an add button. */
		trailing?: Snippet;
		/** Lets rows run edge to edge; rows then pad themselves. */
		flush?: boolean;
		children: Snippet;
	}

	const { title, trailing, flush = false, children }: Props = $props();
	const headingId = $props.id();
</script>

<section class="card" class:flush aria-labelledby={title === undefined ? undefined : headingId}>
	{#if title !== undefined}
		<header>
			<h2 id={headingId}>{title}</h2>
			{@render trailing?.()}
		</header>
	{/if}
	{@render children()}
</section>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0 calc(-1 * var(--space-4));
		padding: var(--space-4);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.flush {
		gap: 0;
		padding: var(--space-4) 0 var(--space-2);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--space-6);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}

	.flush header {
		padding: 0 var(--space-4) var(--space-2);
	}

	h2 {
		color: var(--color-text-muted);
		font-size: var(--font-size-label);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-label);
		text-transform: uppercase;
	}
</style>
