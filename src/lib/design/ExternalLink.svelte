<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for a link that leaves the app and opens in the browser. */
	interface Props {
		/** An absolute URL on another site. */
		href: string;
		children: Snippet;
	}

	const { href, children }: Props = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer">{@render children()}</a>
