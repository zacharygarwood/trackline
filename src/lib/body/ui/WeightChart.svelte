<script lang="ts">
	import LineChart from '../../design/LineChart.svelte';
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

<LineChart
	points={data.points}
	trend={data.trend}
	goal={data.goal}
	summary={data.summary}
	formatValue={formatAxis}
/>
