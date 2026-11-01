<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import ExternalLink from '#lib/design/ExternalLink.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { ExternalUrl } from '#lib/ui/external-url.constants.ts';
	import { SiteRoute } from '../site-route.constants.ts';
	import type { LayoutProps } from './$types';

	const { children }: LayoutProps = $props();

	const onHome = $derived(page.url.pathname === resolve(SiteRoute.home));
</script>

<div class="site" data-site>
	{#if !onHome}
		<header>
			<a href={resolve(SiteRoute.home)}>{messages.site.home}</a>
		</header>
	{/if}

	<main>
		{@render children()}
	</main>

	<footer>
		<nav aria-label={messages.site.footer}>
			<ul>
				<li><a href={resolve(SiteRoute.install)}>{messages.site.install}</a></li>
				<li><a href={resolve(SiteRoute.privacy)}>{messages.site.privacy}</a></li>
				<li><a href={resolve(SiteRoute.faq)}>{messages.site.faq}</a></li>
				<li><ExternalLink href={ExternalUrl.source}>{messages.site.source}</ExternalLink></li>
				<li><ExternalLink href={ExternalUrl.donate}>{messages.site.donate}</ExternalLink></li>
			</ul>
		</nav>
	</footer>
</div>

<style>
	.site {
		display: flex;
		flex-direction: column;
		gap: var(--space-12);
		max-width: var(--content-max-width);
		min-height: 100dvh;
		margin: 0 auto;
		padding: calc(var(--space-8) + env(safe-area-inset-top)) var(--space-4)
			calc(var(--space-8) + env(safe-area-inset-bottom));
	}

	header a {
		color: var(--color-text);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	main {
		flex: 1;
	}

	footer {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-6);
		border-top: var(--border-hairline) solid var(--color-divider);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-4);
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
