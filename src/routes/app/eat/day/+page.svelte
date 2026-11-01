<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { FoodScreen } from '#lib/nutrition/ui/food-screen.svelte.ts';
	import { LocalDate } from '#lib/shared/local-date.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { getToaster, reloadOnUndo } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import DayEntries from '../DayEntries.svelte';

	const toaster = getToaster();
	const pastDaysHref = resolve(AppRoute.pastDays);
	const day = page.state.day;
	let screen: FoodScreen | undefined = $state();
	let title = $state('');

	void getAppContext().then(async (app) => {
		const date = day === undefined ? undefined : LocalDate.parse(day);
		if (date?.ok !== true) {
			await goto(pastDaysHref, { replaceState: true });
			return;
		}
		const next = new FoodScreen(app.nutrition, app.clock);
		next.date = date.value;
		await next.load();
		title = formatDate(date.value, app.clock.today());
		screen = next;
	});

	reloadOnUndo(toaster, () => screen?.load());
</script>

<PageHeader
	backHref={pastDaysHref}
	backLabel={messages.shell.back(messages.navigation.pastDays)}
	{title}
/>

{#if screen !== undefined}
	<DayEntries {screen} {day} />
{/if}
