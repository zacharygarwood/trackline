<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '../../design/Card.svelte';
	import LineChart from '../../design/LineChart.svelte';
	import Row from '../../design/Row.svelte';
	import type { StatsChartData } from './stats-charts.ts';

	/** Props for a Stats section: its key numbers as rows, then a line chart. */
	interface Props {
		title: string;
		/** Undefined when the range has no data. */
		data: StatsChartData | undefined;
		/** Shown instead of the chart when there is no data. */
		empty: string;
		/** Controls shown under the title, such as an exercise picker. */
		controls?: Snippet;
	}

	const { title, data, empty, controls }: Props = $props();

	const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
	const formatAxis = (value: number) => whole.format(value);
</script>

<Card {title}>
	{@render controls?.()}
	{#if data === undefined}
		<p class="empty">{empty}</p>
	{:else}
		{#each data.facts as fact (fact.label)}
			<Row label={fact.label} value={fact.value} />
		{/each}
		<div class="chart">
			<LineChart
				points={data.points}
				trend={data.trend}
				goal={data.goal}
				summary={data.summary}
				formatValue={formatAxis}
			/>
		</div>
	{/if}
</Card>

<style>
	.empty {
		display: flex;
		align-items: center;
		min-height: var(--row-height);
		color: var(--color-text-muted);
	}

	.chart {
		padding: var(--space-2) 0;
	}
</style>
