<script lang="ts">
	import Heatmap from '../../design/Heatmap.svelte';
	import type { LocalDate } from '../../shared/local-date.ts';
	import type { WeekStart } from '../../shared/week-start.constants.ts';
	import type { ActivityHeatmap } from './activity-heatmaps.ts';

	/** Props for one titled 52-week heatmap with its legend. */
	interface Props {
		heatmap: ActivityHeatmap;
		/** The last day drawn. */
		today: LocalDate;
		/** The day at the top of each column. */
		weekStart: WeekStart;
	}

	const { heatmap, today, weekStart }: Props = $props();

	const WEEKS = 52;
</script>

<section>
	<h3>{heatmap.title}</h3>
	<Heatmap {today} weeks={WEEKS} {weekStart} shadeOf={heatmap.shadeOf} summary={heatmap.summary} />
	{#if heatmap.legend.length > 0}
		<p class="legend" aria-hidden="true">
			{#each heatmap.legend as entry (entry.label)}
				<span class={entry.shade}>{entry.label}</span>
			{/each}
		</p>
	{/if}
</section>

<style>
	h3 {
		margin-bottom: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}

	.legend {
		display: flex;
		gap: var(--space-4);
		margin-top: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	span::before {
		content: '';
		display: inline-block;
		width: var(--space-3);
		height: var(--space-3);
		margin-right: var(--space-2);
		vertical-align: middle;
		border-radius: var(--radius-small);
	}

	.full::before {
		background: var(--color-accent);
	}

	.muted::before {
		background: var(--color-heat-muted);
	}
</style>
