<script lang="ts">
	import Bars from '#lib/design/Bars.svelte';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import { ChartSize } from '#lib/design/chart.constants.ts';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';

	/** Props for the daily calories chart on Stats. */
	interface Props {
		stats: StatsScreen;
	}

	const { stats: ready }: Props = $props();
	const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
	const goal = $derived(ready.calorieGoal);
</script>

<div class="chart">
	<p class="split">
		<BigNumber value={whole.format(ready.calorieAverage)} suffix={messages.trends.average} />
		{#if goal !== undefined}<span>{messages.trends.goal(whole.format(goal))}</span>{/if}
	</p>
	<Bars
		values={ready.calorieBars}
		scale={ready.calorieScale}
		{goal}
		size={ChartSize.medium}
		summary={messages.trends.caloriesChart(
			messages.trends.rangeWords[ready.range],
			whole.format(goal ?? 0),
			ready.calorieBars.map((value) => whole.format(value)).join(', ')
		)}
	/>
</div>

<style>
	.chart {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
	}

	.split {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.split span {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-medium);
	}
</style>
