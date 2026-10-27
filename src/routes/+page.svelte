<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { AppRoute } from './app/app-route.constants.ts';
</script>

<svelte:head>
	<title>{messages.app.name}</title>
	<meta name="description" content={messages.app.tagline} />
</svelte:head>

<main>
	<h1>{messages.app.name}</h1>
	<p>{messages.app.tagline}</p>
	<a href={resolve(AppRoute.today)}>{messages.landing.openApp}</a>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		max-width: var(--content-max-width);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4);
	}

	h1 {
		font-size: var(--font-size-display);
	}
</style>
