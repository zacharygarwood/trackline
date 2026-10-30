<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for a full-width section of a screen: a small label, then its rows, then a divider. */
	interface Props {
		/** The section's label. */
		title?: string;
		/** Shown at the end of the label row, such as a total or an add button. */
		trailing?: Snippet;
		children: Snippet;
	}

	const { title, trailing, children }: Props = $props();
	const headingId = $props.id();
</script>

<section class="card" aria-labelledby={title === undefined ? undefined : headingId}>
	{#if title !== undefined}
		<header>
			<h2 id={headingId}>{title}</h2>
			{@render trailing?.()}
		</header>
	{/if}
	<div class="content">{@render children()}</div>
</section>

<style>
	.card {
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-4) var(--gutter) var(--space-6);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--tap-target);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	h2 {
		font-size: inherit;
		font-weight: inherit;
	}

	.content {
		display: flex;
		flex-direction: column;
	}
</style>
