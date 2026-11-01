<script lang="ts">
	import StepButton from '../../design/StepButton.svelte';

	/** Props for one large − value + row of the workout screen, such as weight or reps. */
	interface Props {
		/** The label under the number, such as "lb" or "reps". */
		label: string;
		/** The typed value. */
		value: string;
		lessLabel: string;
		moreLabel: string;
		oninput: (text: string) => void;
		onstep: (direction: number) => void;
	}

	const { label, value, lessLabel, moreLabel, oninput, onstep }: Props = $props();
	const id = $props.id();
	const UP = 1;
	const DOWN = -1;
</script>

<div class="field">
	<StepButton
		large
		label={lessLabel}
		symbol="−"
		onclick={() => {
			onstep(DOWN);
		}}
	/>
	<div class="value">
		<input
			{id}
			type="number"
			inputmode="decimal"
			min="0"
			{value}
			oninput={(event) => {
				oninput(event.currentTarget.value);
			}}
			onfocus={(event) => {
				event.currentTarget.select();
			}}
		/>
		<label for={id}>{label}</label>
	</div>
	<StepButton
		large
		label={moreLabel}
		symbol="+"
		onclick={() => {
			onstep(UP);
		}}
	/>
</div>

<style>
	.field {
		display: flex;
		align-items: center;
		padding: var(--gap-10) var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	.value {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
	}

	input {
		width: 100%;
		height: var(--stepper-field-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid transparent;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-60);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-number);
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}

	label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
