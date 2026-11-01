<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { AppRoute } from '../../app/app-route.constants.ts';

	const { install } = messages;
	const platforms = [
		{ title: install.iphoneTitle, browsers: install.iphone },
		{ title: install.androidTitle, browsers: install.android }
	] as const;
</script>

<svelte:head>
	<title>{messages.pageTitle(messages.site.install)}</title>
	<meta name="description" content={install.summary} />
</svelte:head>

<article>
	<section>
		<h1>{install.title}</h1>
		<p class="summary">{install.summary}</p>
		<a class="open" href={resolve(AppRoute.today)}>{messages.landing.openApp}</a>
	</section>

	{#each platforms as platform (platform.title)}
		<section>
			<h2>{platform.title}</h2>
			<dl>
				{#each platform.browsers as browser (browser.browser)}
					<div>
						<dt>{browser.browser}</dt>
						<dd>{browser.steps}</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/each}

	<p>{install.after}</p>
</article>

<style>
	article,
	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	section {
		gap: var(--space-3);
	}

	h1 {
		font-size: var(--font-size-34);
		line-height: 1.1;
	}

	h2 {
		font-size: var(--font-size-22);
	}

	.summary {
		font-size: var(--font-size-20);
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

	dl {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin: 0;
	}

	dt {
		font-weight: var(--font-weight-semibold);
	}

	dd {
		margin: 0;
	}
</style>
