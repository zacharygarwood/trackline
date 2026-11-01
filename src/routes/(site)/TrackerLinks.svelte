<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { SiteRoute, TemplatePage } from '../site-route.constants.ts';

	/** Props for the list of links to the template pages. */
	interface Props {
		title: string;
		/** The page being shown, left out of the list. */
		current?: TemplatePage;
	}

	const { title, current }: Props = $props();

	const pages = $derived(Object.values(TemplatePage).filter((page) => page !== current));
</script>

<section>
	<h2>{title}</h2>
	<ul>
		{#each pages as template (template)}
			<li>
				<a href={resolve(SiteRoute.template, { template })}>
					{messages.templatePages.pages[template].link}
				</a>
			</li>
		{/each}
		<li><a href={resolve(SiteRoute.trackers)}>{messages.templatePages.more}</a></li>
	</ul>
</section>

<style>
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
