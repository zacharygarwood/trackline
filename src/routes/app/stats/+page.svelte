<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import Bars from '#lib/design/Bars.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import TrendLine from '#lib/design/TrendLine.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { statsChart } from '#lib/tracking/ui/stats-chart.ts';
	import { ChartType } from '#lib/tracking/ui/stats-chart.constants.ts';
	import { StatsScreen } from '#lib/tracking/ui/stats-screen.svelte.ts';
	import { goalText } from '#lib/tracking/ui/value-format.ts';

	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let stats: StatsScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new StatsScreen(app.tracking.listStats);
		await next.load(preferences.weekStart);
		stats = next;
	});
</script>

<PageHeader title={messages.tracking.stats.title} />

{#if stats?.charts !== undefined}
	{#if stats.charts.length === 0}
		<p class="empty">{messages.tracking.stats.empty}</p>
	{/if}
	{#each stats.charts as series (series.tracker.id)}
		{@const chart = statsChart(series, units)}
		<section>
			<SectionTitle title={series.tracker.name} />
			<p class="goal">{goalText(series.tracker, units)}</p>
			{#if chart.type === ChartType.bars}
				<Bars values={chart.values} scale={chart.scale} goal={chart.goal} summary={chart.summary} />
			{:else if chart.type === ChartType.line}
				<TrendLine values={chart.values} padding={chart.padding} summary={chart.summary} />
			{:else}
				<p class="empty">{messages.tracking.page.nothingLogged}</p>
			{/if}
		</section>
	{/each}
{/if}

<style>
	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}

	.goal {
		margin-bottom: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-13);
	}
</style>
