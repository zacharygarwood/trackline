<script lang="ts">
	import type { Snippet } from 'svelte';
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

<section>
	<h2>{title}</h2>
	{@render controls?.()}
	{#if data === undefined}
		<p class="empty">{empty}</p>
	{:else}
		<figure>
			<LineChart
				points={data.points}
				trend={data.trend}
				goal={data.goal}
				summary={data.summary}
				formatValue={formatAxis}
			/>
			<figcaption>
				{#each legend as entry (entry.label)}
					<span class={entry.mark}>{entry.label}</span>
				{/each}
			</figcaption>
		</figure>
	{/if}
</section>

<style>
	h2 {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-body);
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

	span::before {
		content: '';
		display: inline-block;
		width: var(--space-4);
		margin-right: var(--space-2);
		vertical-align: middle;
		border-top: var(--focus-ring-width) solid var(--color-accent);
	}

	.dashed::before {
		border-top: var(--border-hairline) dashed var(--color-text-muted);
	}

	.dot::before {
		width: var(--space-2);
		height: var(--space-2);
		border: none;
		border-radius: var(--radius-round);
		background: var(--color-text-muted);
	}
</style>
