<script lang="ts">
	import ProgressBar from '../../design/ProgressBar.svelte';
	import Ring from '../../design/Ring.svelte';
	import { Tone } from '../../design/tone.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import type { DailyNutritionSummary } from '../domain/daily-nutrition-summary.ts';
	import type { Macros } from '../domain/macros.ts';
	import { GRAM_MACRO_KEYS } from './macro-key.constants.ts';
	import {
		formatCalorieNumber,
		formatMacro,
		formatMacroLine,
		MACRO_LABELS
	} from './nutrition-format.ts';

	/** Props for the day's progress toward calorie and macro goals. */
	interface Props {
		/** The day's totals and goals. */
		summary: DailyNutritionSummary;
	}

	const { summary }: Props = $props();

	const TONES = { protein: Tone.protein, carbs: Tone.carbs, fat: Tone.fat } as const;

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
	<div class="totals">
		<p>{formatMacroLine(summary.eaten)}</p>
		<p class="hint">{messages.nutrition.noGoals}</p>
	</div>
{:else}
	{@const targets = summary.targets}
	{@const remaining = summary.remaining}
	<div class="progress">
		<Ring
			value={summary.eaten.calories}
			max={targets.calories}
			label={progressLabel('calories', targets)}
		>
			<span class="big">{formatCalorieNumber(Math.abs(remaining.calories))}</span>
			<span class="unit"
				>{remaining.calories >= 0 ? messages.nutrition.kcalLeft : messages.nutrition.kcalOver}</span
			>
		</Ring>
		<ul>
			{#each GRAM_MACRO_KEYS as key (key)}
				<li>
					<div class="line">
						<span>{MACRO_LABELS[key]}</span>
						<span class="left">{left(key, remaining[key])}</span>
					</div>
					<ProgressBar
						value={summary.eaten[key]}
						max={targets[key]}
						label={progressLabel(key, targets)}
						tone={TONES[key]}
					/>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.progress {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		align-items: center;
		gap: var(--space-4);
	}

	.big {
		font-size: var(--font-size-title);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.unit {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	ul {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.line {
		display: flex;
		justify-content: space-between;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
		font-size: var(--font-size-small);
	}

	.left,
	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}
</style>
