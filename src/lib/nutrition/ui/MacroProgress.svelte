<script lang="ts">
	import ProgressBar from '../../design/ProgressBar.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { DailyNutritionSummary } from '../domain/daily-nutrition-summary.ts';
	import type { Macros } from '../domain/macros.ts';
	import { GRAM_MACRO_KEYS } from './macro-key.constants.ts';
	import { formatMacro, formatMacroProgress, MACRO_LABELS } from './nutrition-format.ts';

	/** Props for the day's totals as rows, against the goals when there are some. */
	interface Props {
		/** The day's totals and goals. */
		summary: DailyNutritionSummary;
	}

	const { summary }: Props = $props();

	function amount(key: keyof Macros): string {
		const targets = summary.targets;
		return targets === undefined
			? formatMacro(key, summary.eaten[key])
			: formatMacroProgress(key, summary.eaten[key], targets[key]);
	}
</script>

<ul class="rows">
	<li>
		<span class="label">{MACRO_LABELS.calories}</span>
		<span class="value">{amount('calories')}</span>
	</li>
	{#if summary.targets !== undefined && summary.remaining !== undefined}
		{@const left = summary.remaining.calories}
		<li class="bar">
			<ProgressBar
				value={summary.eaten.calories}
				max={summary.targets.calories}
				label={messages.nutrition.progressOf(
					MACRO_LABELS.calories,
					formatMacro('calories', summary.eaten.calories),
					formatMacro('calories', summary.targets.calories)
				)}
			/>
		</li>
		<li>
			<span class="label">{left >= 0 ? messages.nutrition.left : messages.nutrition.overGoal}</span>
			<span class="value">{formatMacro('calories', Math.abs(left))}</span>
		</li>
	{/if}
	{#each GRAM_MACRO_KEYS as key (key)}
		<li>
			<span class="label">{MACRO_LABELS[key]}</span>
			<span class="value">{amount(key)}</span>
		</li>
	{/each}
</ul>

<style>
	.rows {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.bar {
		display: block;
	}

	.label {
		color: var(--color-text-muted);
	}

	.value {
		font-family: var(--font-mono);
	}
</style>
