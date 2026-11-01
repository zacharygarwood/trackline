<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { SiteRoute } from '../site-route.constants.ts';
	import Intro from './Intro.svelte';
	import Phones from './Phones.svelte';
	import { Screenshot } from './screenshot.constants.ts';
	import TrackerLinks from './TrackerLinks.svelte';

	const shots = [
		{ file: Screenshot.today, alt: messages.landing.todayScreenshot },
		{ file: Screenshot.stats, alt: messages.landing.statsScreenshot }
	] as const;
</script>

<svelte:head>
	<title>{messages.app.name}</title>
	<meta name="description" content={messages.app.tagline} />
</svelte:head>

<div class="page">
	<Phones {shots} />
	<Intro title={messages.app.name} tagline={messages.app.tagline} large />
	<section>
		<h2>{messages.landing.installTitle}</h2>
		<p>{messages.landing.installIphone}</p>
		<p>{messages.landing.installAndroid}</p>
		<p><a href={resolve(SiteRoute.install)}>{messages.landing.installMore}</a></p>
	</section>
	<TrackerLinks title={messages.landing.trackersTitle} />
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	h2 {
		font-size: var(--font-size-22);
	}
</style>
