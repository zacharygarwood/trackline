<script lang="ts">
	import { resolve } from '$app/paths';
	import ExternalLink from '#lib/design/ExternalLink.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { ExternalUrl } from '#lib/ui/external-url.constants.ts';
	import { AppRoute } from '../../app-route.constants.ts';
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.navigation.support}
/>

<p>{messages.settings.supportPitch}</p>
<div class="kofi">
	<ExternalLink href={ExternalUrl.donate} prominent>{messages.settings.donate}</ExternalLink>
</div>
<p class="thanks">{messages.settings.supportThanks}</p>

<style>
	p {
		color: var(--color-text-muted);
		font-size: var(--font-size-17);
	}

	.kofi {
		margin-top: var(--space-6);
	}

	.thanks {
		margin-top: var(--space-4);
		font-size: var(--font-size-15);
		text-align: center;
	}
</style>
