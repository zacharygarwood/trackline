<script lang="ts">
	import { resolve } from '$app/paths';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';

	const preferences = getPreferences();
</script>

<PageHeader
	backHref={resolve(AppRoute.today)}
	backLabel={messages.shell.back(messages.navigation.today)}
	title={messages.navigation.settings}
/>

<NavRow label={messages.navigation.homeScreen} href={resolve(AppRoute.settingsHome)} />
<NavRow
	label={messages.preferences.theme}
	value={messages.preferences.themes[preferences.current.theme]}
	href={resolve(AppRoute.settingsTheme)}
/>
<NavRow label={messages.navigation.tracking} href={resolve(AppRoute.settingsTracking)} />
<NavRow label={messages.navigation.data} href={resolve(AppRoute.settingsData)} />

<div class="gap"></div>

<NavRow label={messages.navigation.support} href={resolve(AppRoute.settingsSupport)} />
<NavRow label={messages.settings.about} href={resolve(AppRoute.settingsAbout)} />

<style>
	.gap {
		height: var(--space-6);
	}
</style>
