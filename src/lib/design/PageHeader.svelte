<script lang="ts">
	/** Props for the top of a page: the page's title, after a back link unless it is a tab. */
	interface Props {
		/** Where the back link goes; a tab page has none. */
		backHref?: string | undefined;
		/** The back link's text, such as "← Food". */
		backLabel?: string | undefined;
		title: string;
	}

	const { backHref, backLabel, title }: Props = $props();
</script>

{#if backHref !== undefined}
	<a class="back" href={backHref}>{backLabel}</a>
{/if}
<h1 class:tab={backHref === undefined}>{title}</h1>

<style>
	.back {
		display: flex;
		align-items: center;
		align-self: flex-start;
		min-height: var(--tap-target);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	h1 {
		margin: var(--space-2) 0 var(--space-4);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-semibold);
	}

	h1.tab {
		margin-top: var(--space-4);
		font-size: var(--font-size-26);
		letter-spacing: var(--letter-spacing-tight);
	}
</style>
