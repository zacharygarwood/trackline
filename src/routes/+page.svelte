<script lang="ts">
	import { messages } from '#lib/i18n/messages.en.ts';
</script>

<svelte:head>
	<title>{messages.app.name}</title>
	<meta name="description" content={messages.app.tagline} />
</svelte:head>

<main>
	<h1>{messages.app.name}</h1>
	<p>{messages.app.tagline}</p>
	<p>{messages.landing.comingSoon}</p>
</main>
