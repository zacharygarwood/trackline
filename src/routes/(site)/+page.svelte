<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import ExternalLink from '#lib/design/ExternalLink.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { ExternalUrl } from '#lib/ui/external-url.constants.ts';
	import { AppRoute } from '../app/app-route.constants.ts';
	import { Screenshot } from './screenshot.constants.ts';

	const SCREENSHOT_WIDTH = 1082;
	const SCREENSHOT_HEIGHT = 2202;

	const screenshots = [
		{ files: Screenshot.today, alt: messages.landing.todayScreenshot },
		{ files: Screenshot.stats, alt: messages.landing.statsScreenshot }
	] as const;
</script>

<svelte:head>
	<title>{messages.app.name}</title>
	<meta name="description" content={messages.app.tagline} />
</svelte:head>

<div class="landing">
	<div class="phones">
		{#each screenshots as screenshot (screenshot.alt)}
			<picture>
				<source srcset={asset(screenshot.files.dark)} media="(prefers-color-scheme: dark)" />
				<img
					src={asset(screenshot.files.light)}
					alt={screenshot.alt}
					width={SCREENSHOT_WIDTH}
					height={SCREENSHOT_HEIGHT}
				/>
			</picture>
		{/each}
	</div>

	<section class="intro">
		<h1>{messages.app.name}</h1>
		<p class="tagline">{messages.app.tagline}</p>
		<a class="open" href={resolve(AppRoute.today)}>{messages.landing.openApp}</a>
		<p>{messages.landing.promise}</p>
	</section>

	<section>
		<h2>{messages.landing.installTitle}</h2>
		<p>{messages.landing.installIphone}</p>
		<p>{messages.landing.installAndroid}</p>
	</section>

	<section>
		<h2>{messages.landing.freeTitle}</h2>
		<p>{messages.landing.free}</p>
		<ul>
			<li><ExternalLink href={ExternalUrl.source}>{messages.landing.source}</ExternalLink></li>
			<li><ExternalLink href={ExternalUrl.donate}>{messages.landing.donate}</ExternalLink></li>
		</ul>
	</section>
</div>

<style>
	.landing {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.phones {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		border: var(--border-hairline) solid var(--color-divider);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	h1 {
		font-size: var(--font-size-56);
		line-height: 1;
	}

	h2 {
		font-size: var(--font-size-22);
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

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: center;
		min-height: var(--tap-target);
	}
</style>
