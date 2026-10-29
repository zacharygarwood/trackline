<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for the placeholder shown when a list has nothing in it yet. */
	interface Props {
		/** One or two plain sentences saying what belongs here. */
		message: string;
		/** The one action that fills the list, if any. */
		action?: Snippet;
	}

	const { message, action }: Props = $props();
</script>

<div class="empty-state">
	<p>{message}</p>
	{@render action?.()}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		color: var(--color-text-muted);
		text-align: center;
	}

	p {
		max-width: 28ch;
	}
</style>
