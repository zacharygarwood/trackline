<script lang="ts">
	import { messages } from '../i18n/messages.en.ts';
	import { InputMode } from './html.constants.ts';
	import Icon from './Icon.svelte';
	import { parseStepperInput, stepDown, stepUp, type StepRange } from './stepper.ts';

	/** Props for a number field with large minus and plus buttons. */
	interface Props {
		/** What the number is, for example "Reps". */
		label: string;
		/** The current value; bind to it. */
		value: number;
		/** Allowed values and the step size. */
		range: StepRange;
	}

	let { label, value = $bindable(), range }: Props = $props();

	const inputMode = $derived(Number.isInteger(range.step) ? InputMode.numeric : InputMode.decimal);

	let draft: string | undefined = $state();

	function commit(): void {
		value = parseStepperInput(draft ?? '', range) ?? value;
		draft = undefined;
	}
</script>

<div class="stepper" role="group" aria-label={label}>
	<button
		type="button"
		aria-label={messages.design.decrease(label)}
		disabled={value <= range.min}
		onclick={() => (value = stepDown(value, range))}
	>
		<Icon name="minus" />
	</button>
	<input
		type="text"
		inputmode={inputMode}
		aria-label={label}
		value={draft ?? String(value)}
		oninput={(event) => (draft = event.currentTarget.value)}
		onchange={commit}
	/>
	<button
		type="button"
		aria-label={messages.design.increase(label)}
		disabled={value >= range.max}
		onclick={() => (value = stepUp(value, range))}
	>
		<Icon name="plus" />
	</button>
</div>

<style>
	.stepper {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		border: none;
		border-radius: var(--radius-round);
		background: var(--color-surface);
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	input {
		width: 5ch;
		min-height: var(--tap-target);
		border: none;
		border-radius: var(--radius-small);
		background: transparent;
		font-size: var(--font-size-title);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
</style>
