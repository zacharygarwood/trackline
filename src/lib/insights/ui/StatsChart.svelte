<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from '../../design/Card.svelte';
	import LineChart from '../../design/LineChart.svelte';
	import type { LegendMark } from './legend-mark.constants.ts';
	import type { StatsChartData } from './stats-charts.ts';

	/** One legend entry under the chart. */
	interface LegendEntry {
		readonly mark: LegendMark;
		readonly label: string;
	}

	/** Props for a titled Stats line chart with a legend, or a note when there is nothing to draw. */
	interface Props {
		title: string;
		/** Undefined when the range has no data. */
		data: StatsChartData | undefined;
		/** Shown instead of the chart when there is no data. */
		empty: string;
		legend: readonly LegendEntry[];
		/** Controls shown under the title, such as an exercise picker. */
		controls?: Snippet;
	}

	const { title, data, empty, legend, controls }: Props = $props();

	const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
	const formatAxis = (value: number) => whole.format(value);
</script>

<Card {title}>
	{@render controls?.()}
	{#if data === undefined}
		<p class="empty">{empty}</p>
	{:else}
		<p class="headline">
			<span class="value">{data.headline.value}</span>
			<span class="caption">{data.headline.caption}</span>
			{#if data.headline.detail !== undefined}
				<span class="caption">{data.headline.detail}</span>
			{/if}
		</p>
		<figure>
			<LineChart
				points={data.points}
				trend={data.trend}
				goal={data.goal}
				summary={data.summary}
				formatValue={formatAxis}
			/>
			<figcaption aria-hidden="true">
				{#each legend as entry (entry.label)}
					<span class={entry.mark}>{entry.label}</span>
				{/each}
			</figcaption>
		</figure>
	{/if}
</Card>

<style>
	.headline {
		display: flex;
		flex-direction: column;
	}

	.value {
		font-family: var(--font-mono);
		font-size: var(--font-size-stat);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		line-height: 1.2;
	}

	.caption {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}

	figure {
		margin: 0;
	}

	.empty,
	figcaption {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-top: var(--space-2);
	}

	figcaption span::before {
		content: '';
		display: inline-block;
		width: var(--space-4);
		margin-right: var(--space-2);
		vertical-align: middle;
		border-top: var(--focus-ring-width) solid var(--color-accent);
	}

	figcaption .dashed::before {
		border-top: var(--border-hairline) dashed var(--color-text-muted);
	}

	figcaption .dot::before {
		width: var(--space-2);
		height: var(--space-2);
		border: none;
		border-radius: var(--radius-round);
		background: var(--color-text-muted);
	}
</style>
