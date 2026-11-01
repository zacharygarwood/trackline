<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for a link that leaves the app and opens in the browser. */
	interface Props {
		/** An absolute URL on another site. */
		href: string;
		/** Draws the link as a full-width accent button. */
		prominent?: boolean;
		children: Snippet;
	}

	const { href, prominent = false, children }: Props = $props();
</script>

<a {href} class:prominent target="_blank" rel="noopener noreferrer">{@render children()}</a>

<style>
	.prominent {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--button-height);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}
</style>
