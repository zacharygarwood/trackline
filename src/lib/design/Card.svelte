<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for a flat, bordered group that holds one part of a screen. */
	interface Props {
		/** The group's heading. */
		title?: string;
		/** Shown at the end of the heading row, such as a total or a link. */
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
		padding: var(--space-4);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-medium);
		background: var(--color-card);
	}

	.flush {
		gap: 0;
		padding: 0;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}

	.flush header {
		padding: var(--space-3) var(--space-4) var(--space-1);
	}

	h2 {
		color: var(--color-text);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-semibold);
	}
</style>
