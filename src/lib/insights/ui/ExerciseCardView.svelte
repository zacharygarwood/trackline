<script lang="ts">
	import Bars from '../../design/Bars.svelte';
	import BigNumber from '../../design/BigNumber.svelte';
	import { ChartSize } from '../../design/chart.constants.ts';
	import TrendLine from '../../design/TrendLine.svelte';
	import type { ExerciseCard } from './exercise-cards.ts';

	/** Props for one exercise's Stats card. */
	interface Props {
		card: ExerciseCard;
	}

	const { card }: Props = $props();
</script>

<section aria-label={card.name}>
	<h2>{card.name}</h2>
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
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-6) var(--gutter) var(--space-7);
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	h2 {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
