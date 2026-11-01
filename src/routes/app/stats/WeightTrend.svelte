<script lang="ts">
	import { weightChange } from '#lib/body/ui/body-trends.ts';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import TrendLine from '#lib/design/TrendLine.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { StatsScreen } from '#lib/insights/ui/stats-screen.svelte.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { unitLabel } from '#lib/ui/format.ts';

	/** Props for the weight trend on Stats. */
	interface Props {
		stats: StatsScreen;
	}

	const { stats: ready }: Props = $props();
	const KG_PADDING = 0.15;
	const LB_PADDING = 0.3;
	const preferences = getPreferences();
	const unit = $derived(preferences.massUnit);
	const weights = $derived(ready.weights(unit));
	const change = $derived(weightChange(weights));
</script>

{#if weights.length === 0}
	<p class="empty">{messages.trends.noWeight}</p>
{:else}
	<div class="chart">
		<BigNumber
			value={change.latest}
			suffix={unitLabel(unit)}
			note={change.text === change.amount ? undefined : change.text}
		/>
		<TrendLine
			values={weights}
			padding={unit === MassUnit.kg ? KG_PADDING : LB_PADDING}
			summary={messages.trends.weightChart({
				range: messages.trends.rangeWords[ready.range],
				direction: change.direction,
				change: change.amount,
				unit: unitLabel(unit)
			})}
		/>
	</div>
{/if}

<style>
	.chart {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
