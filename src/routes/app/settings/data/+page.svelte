<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import DataSection from '#lib/settings/ui/DataSection.svelte';
	import { DataPanel } from '#lib/settings/ui/data-panel.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	let data: DataPanel | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new DataPanel(app.settings, app.saveFile);
		await next.load();
		data = next;
	});
</script>

<PageHeader
	backHref={resolve(AppRoute.settings)}
	backLabel={messages.shell.back(messages.navigation.settings)}
	title={messages.navigation.data}
/>

{#if data !== undefined}
	<DataSection
		panel={data}
		onreplaced={() => {
			location.reload();
		}}
	/>
{/if}
