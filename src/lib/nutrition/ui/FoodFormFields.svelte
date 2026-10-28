<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import { MACRO_KEYS } from './macro-key.constants.ts';
	import { MACRO_LABELS } from './nutrition-format.ts';
	import type { FoodForm } from './nutrition-day.svelte.ts';

	/** Props for the fields of a new food. */
	interface Props {
		/** The form's values; bind to it. */
		form: FoodForm;
	}

	let { form = $bindable() }: Props = $props();

	const macroFields = MACRO_KEYS.map((key) => ({ key, label: MACRO_LABELS[key] }));
</script>

<label>
	<span>{messages.nutrition.foodName}</span>
	<input
		type="text"
		autocomplete="off"
		bind:value={() => form.name, (name: string) => (form = { ...form, name })}
	/>
</label>
<div class="pair">
	<label>
		<span>{messages.nutrition.referenceAmount}</span>
		<input
			type="text"
			inputmode="decimal"
			bind:value={() => form.amount, (amount: string) => (form = { ...form, amount })}
		/>
	</label>
	<label>
		<span>{messages.nutrition.referenceUnit}</span>
		<input
			type="text"
			autocomplete="off"
			bind:value={() => form.unit, (unit: string) => (form = { ...form, unit })}
		/>
	</label>
</div>
<p class="hint">{messages.nutrition.macrosFor}</p>
<div class="macros">
	{#each macroFields as field (field.key)}
		<label>
			<span>{field.label}</span>
			<input
				type="text"
				inputmode="decimal"
				bind:value={
					() => form[field.key], (value: string) => (form = { ...form, [field.key]: value })
				}
			/>
		</label>
	{/each}
</div>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--font-size-small);
	}

	input {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: var(--border-hairline) solid var(--color-divider);
		border-radius: var(--radius-small);
		background: var(--color-surface);
		font-size: var(--font-size-body);
	}

	.pair,
	.macros {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}
</style>
