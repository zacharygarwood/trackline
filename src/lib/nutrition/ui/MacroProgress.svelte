<script lang="ts">
	import ProgressBar from '../../design/ProgressBar.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { DailyNutritionSummary } from '../domain/daily-nutrition-summary.ts';
	import type { Macros } from '../domain/macros.ts';
	import { GRAM_MACRO_KEYS } from './macro-key.constants.ts';
	import { formatMacro, formatMacroProgress, MACRO_LABELS } from './nutrition-format.ts';

	/** Props for the day's totals, against the goals when there are some. */
	interface Props {
		/** The day's totals and goals. */
		summary: DailyNutritionSummary;
	}

	const { summary }: Props = $props();

	function left(key: keyof Macros, remaining: number): string {
		return remaining >= 0
			? messages.nutrition.remaining(formatMacro(key, remaining))
			: messages.nutrition.over(formatMacro(key, -remaining));
	}

	function progressLabel(key: keyof Macros, targets: Macros): string {
		return messages.nutrition.progressOf(
			MACRO_LABELS[key],
			formatMacro(key, summary.eaten[key]),
			formatMacro(key, targets[key])
		);
	}
</script>

{#if summary.targets === undefined || summary.remaining === undefined}
	<ul class="totals">
		<li class="calories">
			<span class="label">{MACRO_LABELS.calories}</span>
			<span class="value">{formatMacro('calories', summary.eaten.calories)}</span>
		</li>
		{#each GRAM_MACRO_KEYS as key (key)}
			<li>
				<span class="label">{MACRO_LABELS[key]}</span>
				<span class="value">{formatMacro(key, summary.eaten[key])}</span>
			</li>
		{/each}
	</ul>
	<p class="hint">{messages.nutrition.noGoals}</p>
{:else}
	{@const targets = summary.targets}
	{@const remaining = summary.remaining}
	<ul class="totals">
		<li class="calories">
			<div class="line">
				<span class="label">{MACRO_LABELS.calories}</span>
				<span class="value">
					{formatMacroProgress('calories', summary.eaten.calories, targets.calories)}
				</span>
			</div>
			<ProgressBar
				value={summary.eaten.calories}
				max={targets.calories}
				label={progressLabel('calories', targets)}
			/>
			<span class="hint">{left('calories', remaining.calories)}</span>
		</li>
		{#each GRAM_MACRO_KEYS as key (key)}
			<li>
				<span class="label">{MACRO_LABELS[key]}</span>
				<span class="value">{formatMacroProgress(key, summary.eaten[key], targets[key])}</span>
				<ProgressBar
					value={summary.eaten[key]}
					max={targets[key]}
					label={progressLabel(key, targets)}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.totals {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-4) var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.calories {
		grid-column: 1 / -1;
	}

	.line {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.label {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.value {
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}
</style>
