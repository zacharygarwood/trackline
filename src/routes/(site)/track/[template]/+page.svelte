<script lang="ts">
	import { messages } from '#lib/i18n/messages.en.ts';
	import Intro from '../../Intro.svelte';
	import Phones from '../../Phones.svelte';
	import { TrackerScreenshot } from '../../screenshot.constants.ts';
	import TrackerLinks from '../../TrackerLinks.svelte';
	import type { PageProps } from './$types';

	const { data }: PageProps = $props();

	const text = $derived(messages.templatePages.pages[data.template]);
	const shots = $derived([
		{ file: TrackerScreenshot[data.template].page, alt: text.screenshots.page },
		{ file: TrackerScreenshot[data.template].detail, alt: text.screenshots.detail }
	]);
</script>

<svelte:head>
	<title>{messages.pageTitle(text.title)}</title>
	<meta name="description" content={text.tagline} />
</svelte:head>

<div class="page">
	<Phones {shots} />
	<Intro title={text.title} tagline={text.tagline} />
	<section>
		<h2>{messages.templatePages.featuresTitle}</h2>
		<ul>
			{#each text.features as feature (feature)}
				<li>{feature}</li>
			{/each}
		</ul>
	</section>
	<TrackerLinks title={messages.templatePages.otherTitle} current={data.template} />
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

	ul {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-left: var(--space-5);
		list-style: disc;
	}
</style>
