<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import { getToaster, reloadOnUndo } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import DayEntries from '../DayEntries.svelte';

	const toaster = getToaster();
	let screen: FoodScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new FoodScreen(app.nutrition, app.clock);
		await next.load();
		screen = next;
	});

	reloadOnUndo(toaster, () => screen?.load());
</script>

<PageHeader
	backHref={resolve(AppRoute.eat)}
	backLabel={messages.shell.back(messages.navigation.eat)}
	title={messages.navigation.today}
/>

{#if screen !== undefined}
	<DayEntries {screen} />
{/if}
