<script lang="ts">
	import LineChart from '../../design/LineChart.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { MassUnit } from '../../shared/mass-unit.constants.ts';
	import type { WeightGoal } from '../domain/weight-goal.ts';
	import type { WeighIn } from '../domain/weigh-in.ts';
	import { weightChartData } from './weight-chart.ts';

	/** Props for the body weight graph. */
	interface Props {
		/** At least one weigh-in. */
		weighIns: readonly WeighIn[];
		/** The active goal, drawn as a dashed line. */
		goal: WeightGoal | undefined;
		/** The unit to plot in. */
		unit: MassUnit;
	}

	const { weighIns, goal, unit }: Props = $props();

	const data = $derived(weightChartData(weighIns, goal, unit));
	const formatAxis = (value: number) => value.toFixed(0);
</script>

<figure>
	<LineChart
		points={data.points}
		trend={data.trend}
		goal={data.goal}
		summary={data.summary}
		formatValue={formatAxis}
	/>
	<figcaption>
		<span class="trend">{messages.body.trendLegend}</span>
		{#if goal !== undefined}
			<span class="goal">{messages.body.goalLegend}</span>
		{/if}
	</figcaption>
</figure>

<style>
	figure {
		margin: 0;
	}

	figcaption {
		display: flex;
		gap: var(--space-4);
		margin-top: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	span::before {
		content: '';
		display: inline-block;
		width: var(--space-4);
		margin-right: var(--space-2);
		vertical-align: middle;
		border-top: var(--focus-ring-width) solid var(--color-accent);
	}

	.goal::before {
		border-top: var(--border-hairline) dashed var(--color-text-muted);
	}
</style>
