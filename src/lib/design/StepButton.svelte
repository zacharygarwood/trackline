<script lang="ts">
	/** Props for a square − or + button beside a number. */
	interface Props {
		/** What the step does, for example "1 rep more". */
		label: string;
		/** The symbol shown, "−" or "+". */
		symbol: string;
		onclick: () => void;
		/** Draws the large 56 px button of the workout screen. */
		large?: boolean;
	}

	const { label, symbol, onclick, large = false }: Props = $props();
</script>

<button type="button" class:large aria-label={label} {onclick}>{symbol}</button>

<style>
	button {
		flex: none;
		width: var(--control-height);
		height: var(--control-height);
		padding: 0;
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
	}

	.large {
		width: var(--stepper-size);
		height: var(--stepper-size);
		font-size: var(--font-size-26);
	}
</style>
