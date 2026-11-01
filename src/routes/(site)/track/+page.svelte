<script lang="ts">
	import { resolve } from '$app/paths';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { BASICS } from '#lib/tracking/domain/basics.ts';
	import { TEMPLATE_SECTIONS } from '#lib/tracking/ui/template-groups.ts';
	import { SiteRoute, TemplatePage } from '../../site-route.constants.ts';
	import Intro from '../Intro.svelte';

	const text = messages.templatePages;
	const { templates, templateHints, groups } = messages.tracking;
	const pages: readonly string[] = Object.values(TemplatePage);
</script>

<svelte:head>
	<title>{messages.pageTitle(text.allTitle)}</title>
	<meta name="description" content={text.allTagline} />
</svelte:head>

<div class="page">
	<Intro title={text.allTitle} tagline={text.allTagline} />

	<section>
		<h2>{text.readyTitle}</h2>
		{#each TEMPLATE_SECTIONS as section (section.group)}
			<h3>{groups[section.group]}</h3>
			<dl>
				{#each section.templates as template (template.key)}
					<div>
						<dt>
							{#if pages.includes(template.key)}
								<a href={resolve(SiteRoute.template, { template: template.key })}>
									{templates[template.key]}
								</a>
							{:else}
								{templates[template.key]}
							{/if}
						</dt>
						<dd>{templateHints[template.key]}</dd>
					</div>
				{/each}
			</dl>
		{/each}
	</section>

	<section>
		<h2>{text.buildTitle}</h2>
		<p>{text.buildSummary}</p>
		<dl>
			{#each BASICS as basic (basic.key)}
				<div>
					<dt>{templates[basic.key]}</dt>
					<dd>{templateHints[basic.key]}</dd>
				</div>
			{/each}
		</dl>
	</section>
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

	h3 {
		margin-top: var(--space-3);
		font-size: var(--font-size-17);
	}

	dl {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
	}

	dt {
		font-weight: var(--font-weight-semibold);
	}

	dd {
		margin: 0;
		color: var(--color-text-muted);
	}
</style>
