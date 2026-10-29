<script lang="ts">
	import ProgressBar from '../../design/ProgressBar.svelte';
	import Row from '../../design/Row.svelte';
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

<Row label={MACRO_LABELS.calories} value={amount('calories')} />
{#if summary.targets !== undefined}
	<ProgressBar
		value={summary.eaten.calories}
		max={summary.targets.calories}
		label={messages.nutrition.progressOf(
			MACRO_LABELS.calories,
			formatMacro('calories', summary.eaten.calories),
			formatMacro('calories', summary.targets.calories)
		)}
	/>
{/if}
{#each GRAM_MACRO_KEYS as key (key)}
	<Row label={MACRO_LABELS[key]} value={amount(key)} />
{/each}
