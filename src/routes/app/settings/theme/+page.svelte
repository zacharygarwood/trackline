<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import ThemePicker from '#lib/settings/ui/ThemePicker.svelte';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.preferences.theme}
/>

<ThemePicker {preferences} />
