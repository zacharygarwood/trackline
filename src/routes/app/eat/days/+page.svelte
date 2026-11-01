<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	let stats: StatsScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new StatsScreen(app.insights, app.clock);
		await next.load();
		stats = next;
	});
</script>

<PageHeader
	backHref={resolve(AppRoute.eat)}
	backLabel={messages.shell.back(messages.navigation.eat)}
	title={messages.navigation.pastDays}
/>

{#if stats !== undefined}
	{@const ready = stats}
	<ul aria-label={messages.navigation.pastDays}>
		{#each ready.pastDays as day (day.date.toString())}
			<li>
				<NavRow
					label={formatDate(day.date, ready.today)}
					onclick={() => goto(resolve(AppRoute.pastDay), { state: { day: day.date.toString() } })}
				/>
			</li>
		{/each}
	</ul>
	{#if ready.pastDays.length === 0}
		<p class="empty">{messages.food.noPastDays}</p>
	{/if}
{/if}

<style>
	.empty {
		margin-top: var(--space-4);
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
