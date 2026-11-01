<script lang="ts">
	import type { Snippet } from 'svelte';
	import { numberText, numberValue } from '../../design/number-text.ts';
	import StepButton from '../../design/StepButton.svelte';
	import { messages } from '../../i18n/messages.en.ts';

	/** Props for a food page's − amount + row, a line of detail under it, and an action below. */
	interface Props {
		/** The amount as typed; bind to it. */
		value: string;
		/** The field's accessible name, for example "Amount of Oats in servings". */
		label: string;
		/** The unit's name after the field. */
		unit: string;
		/** A line under the row, such as calories and protein. */
		detail: string;
		onstep: (direction: number) => void;
		/** Called when the typed amount is committed. */
		onchange?: () => void;
		/** The action under the stepper, such as Add or Remove. */
		action: Snippet;
	}

	let { value = $bindable(), label, unit, detail, onstep, onchange, action }: Props = $props();
	const id = $props.id();
	const UP = 1;
	const DOWN = -1;
</script>

<div class="stepper">
	<div class="row">
		<StepButton
			label={messages.food.less}
			symbol="−"
			onclick={() => {
				onstep(DOWN);
			}}
		/>
		<label class="visually-hidden" for={id}>{label}</label>
		<input
			{id}
			type="number"
			inputmode="decimal"
			min="0"
			bind:value={() => numberValue(value), (typed: number | null) => (value = numberText(typed))}
			{onchange}
			onfocus={(event) => {
				event.currentTarget.select();
			}}
		/>
		<StepButton
			label={messages.food.more}
			symbol="+"
			onclick={() => {
				onstep(UP);
			}}
		/>
		<span class="unit">{unit}</span>
	</div>
	<p aria-live="polite">{detail}</p>
	{@render action()}
</div>

<style>
	.stepper {
		display: flex;
		flex-direction: column;
		gap: var(--gap-10);
	}

	.row {
		display: flex;
		align-items: center;
	}

	input {
		width: var(--amount-field-width);
		height: var(--control-height);
		margin: 0 calc(-1 * var(--border-control));
		padding: 0;
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-bold);
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.unit {
		flex: 1;
		padding-left: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	p {
		margin-bottom: var(--space-5);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}
</style>
