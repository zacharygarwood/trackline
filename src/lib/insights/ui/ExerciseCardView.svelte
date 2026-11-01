<script lang="ts">
	import Bars from '../../design/Bars.svelte';
	import BigNumber from '../../design/BigNumber.svelte';
	import { ChartSize } from '../../design/chart.constants.ts';
	import TrendLine from '../../design/TrendLine.svelte';
	import type { ExerciseCard } from './exercise-cards.ts';

	/** Props for one exercise's chart on its own page: a headline number and a line or bars. */
	interface Props {
		card: ExerciseCard;
	}

	const { card }: Props = $props();
</script>

<div class="card">
	<BigNumber value={card.big} suffix={card.unit === '' ? undefined : card.unit} note={card.delta} />
	{#if card.line !== undefined}
		<TrendLine
			values={card.line}
			padding={card.padding}
			size={ChartSize.short}
			summary={card.summary}
		/>
	{:else if card.bars !== undefined}
		<Bars values={card.bars} scale={Math.max(1, ...card.bars)} summary={card.summary} />
	{/if}
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
	}
</style>
