<script lang="ts">
	import { messages } from '#lib/i18n/messages.en.ts';
</script>

<svelte:head>
	<title>{messages.pageTitle(messages.site.faq)}</title>
	<meta name="description" content={messages.faq.title} />
</svelte:head>

<article>
	<h1>{messages.faq.title}</h1>
	{#each messages.faq.entries as entry (entry.question)}
		<section>
			<h2>{entry.question}</h2>
			<p>{entry.answer}</p>
		</section>
	{/each}
</article>

<style>
	article {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	h1 {
		font-size: var(--font-size-title);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	h2 {
		font-size: var(--font-size-body);
	}
</style>
