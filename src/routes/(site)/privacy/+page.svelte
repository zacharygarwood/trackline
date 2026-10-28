<script lang="ts">
	import { messages } from '#lib/i18n/messages.en.ts';
</script>

<svelte:head>
	<title>{messages.pageTitle(messages.privacy.title)}</title>
	<meta name="description" content={messages.privacy.summary} />
</svelte:head>

<article>
	<h1>{messages.privacy.title}</h1>
	<p class="summary">{messages.privacy.summary}</p>
	{#each messages.privacy.paragraphs as paragraph (paragraph)}
		<p>{paragraph}</p>
	{/each}
</article>

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	h1 {
		font-size: var(--font-size-title);
	}

	.summary {
		font-weight: var(--font-weight-semibold);
	}
</style>
