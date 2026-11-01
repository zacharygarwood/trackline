<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SearchField from '#lib/design/SearchField.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, open, replace } from '../../open.ts';

	const preferences = getPreferences();
	let screen: TrackerScreen | undefined = $state();
	let search = $state('');

	void getAppContext().then(async (app) => {
		const next = new TrackerScreen(app.tracking, app.clock, preferences.weekStart);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		screen = next;
	});

	const typed = $derived(search.trim());
	const matches = $derived(
		(screen?.subjects ?? []).filter((food) => food.name.toLowerCase().includes(typed.toLowerCase()))
	);
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={messages.tracking.food.add}
	onback={back}
/>

{#if screen?.tracker !== undefined}
	{@const tracker = screen.tracker}
	<SearchField label={messages.tracking.food.search} bind:value={search} />
	<ul>
		{#each matches as food (food.id)}
			<li>
				<NavRow
					label={food.name}
					onclick={() => open(AppRoute.portion, { tracker: tracker.id, subject: food.id })}
				/>
			</li>
		{/each}
		{#if typed !== ''}
			<li>
				<NavRow
					label={messages.tracking.food.create(typed)}
					onclick={() => open(AppRoute.newSubject, { tracker: tracker.id, name: typed })}
				/>
			</li>
		{/if}
		<li>
			<NavRow
				label={messages.tracking.food.quickAdd}
				onclick={() => open(AppRoute.log, { tracker: tracker.id })}
			/>
		</li>
	</ul>
{/if}
