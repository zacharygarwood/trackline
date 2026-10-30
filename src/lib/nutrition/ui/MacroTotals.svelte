<script lang="ts">
	import BigNumber from '../../design/BigNumber.svelte';
	import { NumberSize } from '../../design/big-number.constants.ts';
	import ProgressBar from '../../design/ProgressBar.svelte';
	import { TickSize } from '../../design/tick-size.constants.ts';
	import { messages } from '../../i18n/messages.en.ts';
	import type { DailyNutritionSummary } from '../domain/daily-nutrition-summary.ts';
	import type { Macros } from '../domain/macros.ts';
	import { PROTEIN_ONLY, TRACKED_MACRO_KEYS } from './macro-key.constants.ts';
	import { formatMacro, formatMacroNumber, MACRO_LABELS } from './nutrition-format.ts';

	/** Props for the day's calories and macros as large numbers over rows of ticks. */
	interface Props {
		summary: DailyNutritionSummary;
		/** Whether carbs and fat are shown beside protein. */
		trackCarbsAndFat: boolean;
		/** Today's larger layout, with labels above each number, or Food's compact one. */
		today: boolean;
	}

	const { summary, trackCarbsAndFat, today }: Props = $props();

	const macroKeys = $derived(trackCarbsAndFat ? TRACKED_MACRO_KEYS : PROTEIN_ONLY);
	const calories = $derived(summary.eaten.calories);
	const calorieGoal = $derived(summary.targets?.calories);
	const over = $derived(
		calorieGoal !== undefined && calories > calorieGoal
			? messages.food.over(formatMacroNumber(calories - calorieGoal))
			: undefined
	);

	function goal(key: keyof Macros, withUnit: boolean): string | undefined {
		const target = summary.targets?.[key];
		if (target === undefined) return undefined;
		return messages.food.goal(withUnit ? formatMacro(key, target) : formatMacroNumber(target));
	}
</script>

{#if today}
	<span class="label">{MACRO_LABELS.calories}</span>
	<span class="headline">
		<BigNumber
			value={formatMacroNumber(calories)}
			suffix={goal('calories', false)}
			size={NumberSize.hero}
		/>
		{#if over !== undefined}<span class="over">{over}</span>{/if}
	</span>
	<ProgressBar value={calories} max={calorieGoal ?? 0} size={TickSize.hero} />
	{#each macroKeys as key (key)}
		<span class="today-macro">
			<span class="label">{MACRO_LABELS[key]}</span>
			<BigNumber
				value={formatMacroNumber(summary.eaten[key])}
				suffix={goal(key, true)}
				size={NumberSize.macro}
			/>
			<ProgressBar value={summary.eaten[key]} max={summary.targets?.[key] ?? 0} />
		</span>
	{/each}
{:else}
	<div class="food-totals">
		<BigNumber
			value={formatMacroNumber(calories)}
			suffix={goal('calories', true)}
			size={NumberSize.large}
		/>
		<ProgressBar value={calories} max={calorieGoal ?? 0} size={TickSize.food} />
		{#each macroKeys as key (key)}
			<div class="food-macro">
				<p class="row">
					<span class="label">{MACRO_LABELS[key]}</span>
					<BigNumber
						value={formatMacroNumber(summary.eaten[key])}
						suffix={goal(key, true)}
						size={NumberSize.figure}
					/>
				</p>
				<ProgressBar
					value={summary.eaten[key]}
					max={summary.targets?.[key] ?? 0}
					size={TickSize.small}
				/>
			</div>
		{/each}
	</div>
{/if}

<style>
	.label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.headline {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		width: 100%;
	}

	.over {
		color: var(--color-accent);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.today-macro {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
		margin-top: var(--gap-10);
	}

	.food-totals {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-bottom: var(--space-6);
	}

	.food-macro {
		display: flex;
		flex-direction: column;
		gap: var(--gap-10);
		margin-top: var(--gap-14);
	}

	.row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}
</style>
