<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import AboutSection from '#lib/settings/ui/AboutSection.svelte';
	import { AppRoute } from '../../app-route.constants.ts';
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.settings.about}
/>

<AboutSection version={__APP_VERSION__} />
