<script lang="ts">
	/** Props for a number field that shows its unit inside the box, like "150 g". */
	interface Props {
		/** What the number is, for example "Protein". */
		label: string;
		/** The unit shown after the number, for example "g". */
		unit: string;
		/** The typed text; bind to it. */
		value: string;
	}

	let { label, unit, value = $bindable() }: Props = $props();
</script>

<label>
	<span class="label">{label}</span>
	<span class="box">
		<input type="text" inputmode="decimal" autocomplete="off" bind:value />
		<span class="unit" aria-hidden="true">{unit}</span>
	</span>
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.box {
		display: flex;
		align-items: center;
		min-height: var(--tap-target);
		border-bottom: var(--border-field) solid var(--color-field-line);
	}

	.box:focus-within {
		border-bottom-color: var(--color-text);
	}

	input {
		flex: 1;
		min-width: 0;
		padding: 0;
		border: none;
		background: transparent;
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-bold);
		font-variant-numeric: tabular-nums;
		outline: none;
	}

	.unit {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-regular);
	}
</style>
