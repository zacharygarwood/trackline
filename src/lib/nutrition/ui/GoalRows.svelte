<script lang="ts">
	import type { Macros } from '../domain/macros.ts';
	import type { DailyGoalsEditor } from './daily-goals-editor.svelte.ts';
	import { CALORIES_AND_PROTEIN, MACRO_KEYS } from './macro-key.constants.ts';
	import { MACRO_LABELS, MACRO_UNITS } from './nutrition-format.ts';

	/** Props for the daily goal rows of Settings, one number per macro. */
	interface Props {
		editor: DailyGoalsEditor;
		/** Whether carbs and fat get rows too. */
		trackCarbsAndFat: boolean;
	}

	const { editor, trackCarbsAndFat }: Props = $props();
	const BLANK = '0';
	const keys = $derived(trackCarbsAndFat ? MACRO_KEYS : CALORIES_AND_PROTEIN);

	async function save(key: keyof Macros, text: string): Promise<void> {
		const form = { ...editor.form, [key]: text };
		const blankAsZero = (value: string) => (value.trim() === '' ? BLANK : value);
		await editor.save({
			calories: blankAsZero(form.calories),
			protein: blankAsZero(form.protein),
			carbs: blankAsZero(form.carbs),
			fat: blankAsZero(form.fat)
		});
	}
</script>

{#each keys as key (key)}
	<div class="goal">
		<label for="goal-{key}">{MACRO_LABELS[key]}</label>
		<input
			id="goal-{key}"
			type="number"
			inputmode="numeric"
			min="0"
			value={editor.form[key]}
			onchange={(event) => save(key, event.currentTarget.value)}
		/>
		<span>{MACRO_UNITS[key]}</span>
	</div>
{/each}

<style>
	.goal {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--setting-row-height);
		padding: 0 var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	label {
		flex: 1;
		font-size: var(--font-size-17);
	}

	input {
		width: var(--goal-field-width);
		height: var(--tap-target);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-bold);
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	span {
		width: var(--goal-unit-width);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}
</style>
