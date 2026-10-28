<script lang="ts">
	import ProgressBar from '../../design/ProgressBar.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import type { DailyNutritionSummary } from '../domain/daily-nutrition-summary.ts';
	import type { Macros } from '../domain/macros.ts';
	import { MACRO_KEYS } from './macro-key.constants.ts';
	import { formatMacro, formatMacroLine, MACRO_LABELS } from './nutrition-format.ts';

	/** Props for the day's progress toward calorie and macro goals. */
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
</script>

{#if summary.targets === undefined || summary.remaining === undefined}
	<div class="totals">
		<p>{formatMacroLine(summary.eaten)}</p>
		<p class="hint">{messages.nutrition.noGoals}</p>
	</div>
{:else}
	{@const targets = summary.targets}
	{@const remaining = summary.remaining}
	<ul>
		{#each MACRO_KEYS as key (key)}
			<li>
				<div class="line">
					<span>{MACRO_LABELS[key]}</span>
					<span class="left">{left(key, remaining[key])}</span>
				</div>
				<ProgressBar
					value={summary.eaten[key]}
					max={targets[key]}
					label={messages.nutrition.progressOf(
						MACRO_LABELS[key],
						formatMacro(key, summary.eaten[key]),
						formatMacro(key, targets[key])
					)}
				/>
			</li>
		{/each}
	</ul>
{/if}

<style>
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
		margin-bottom: var(--space-1);
	}

	.left,
	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}
</style>
