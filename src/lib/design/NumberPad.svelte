<script lang="ts">
	import { messages } from '../i18n/messages.en.ts';
	import Icon from './Icon.svelte';
	import { pressKey, type NumberPadLimits } from './number-pad.ts';
	import { DECIMAL_SEPARATOR, DIGIT_KEYS, NumberPadAction } from './number-pad.constants.ts';

	/** Props for an on-screen keypad for entering a number. */
	interface Props {
		/** The entered text, for example `"80.4"`; bind to it. */
		value: string;
		/** Whether decimals are allowed and how many digits fit. */
		limits: NumberPadLimits;
		/**
		 * Whether the value is a suggestion the next key press replaces, like
		 * selected text. Pressing any key clears it; bind to it.
		 */
		selected?: boolean;
	}

	let { value = $bindable(), limits, selected = $bindable(false) }: Props = $props();

	function press(key: string): void {
		value = pressKey(selected ? '' : value, key, limits);
		selected = false;
	}
</script>

<div class="number-pad">
	{#each DIGIT_KEYS as digit (digit)}
		<button
			type="button"
			class:zero={digit === '0'}
			onclick={() => {
				press(digit);
			}}>{digit}</button
		>
	{/each}
	{#if limits.allowDecimal}
		<button
			type="button"
			class="decimal"
			aria-label={messages.design.decimalSeparator}
			onclick={() => {
				press(NumberPadAction.decimal);
			}}>{DECIMAL_SEPARATOR}</button
		>
	{/if}
	<button
		type="button"
		class="backspace"
		aria-label={messages.design.deleteDigit}
		onclick={() => {
			press(NumberPadAction.backspace);
		}}
	>
		<Icon name="backspace" />
	</button>
</div>

<style>
	.number-pad {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2);
	}

	button {
		display: grid;
		place-items: center;
		min-height: var(--number-key-height);
		border: none;
		border-radius: var(--radius-medium);
		background: var(--color-surface);
		font-size: var(--font-size-title);
		font-variant-numeric: tabular-nums;
		cursor: pointer;
	}

	button:active {
		background: var(--color-divider);
	}

	.decimal {
		grid-area: 4 / 1;
	}

	.zero {
		grid-area: 4 / 2;
	}

	.backspace {
		grid-area: 4 / 3;
	}
</style>
