<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { AppRoute } from '../app/app-route.constants.ts';

	/** Props for the heading, one-line pitch, and Open the app button of a site page. */
	interface Props {
		title: string;
		tagline: string;
		/** Draws the title at the landing page's large size. */
		large?: boolean;
	}

	const { title, tagline, large = false }: Props = $props();
</script>

<section>
	<h1 class:large>{title}</h1>
	<p class="tagline">{tagline}</p>
	<a class="open" href={resolve(AppRoute.today)}>{messages.landing.openApp}</a>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	h1 {
		font-size: var(--font-size-34);
		line-height: 1.1;
	}

	.large {
		font-size: var(--font-size-56);
		line-height: 1;
	}

	.tagline {
		font-size: var(--font-size-22);
	}

	.open {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-target);
		padding: var(--space-3) var(--space-6);
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}
</style>
