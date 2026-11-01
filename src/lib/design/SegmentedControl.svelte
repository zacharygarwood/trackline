<script lang="ts" generics="Value extends string">
	/** One choice in a segmented control. */
	interface Option {
		readonly value: Value;
		readonly label: string;
	}

	/** Props for a row of mutually exclusive choices, such as kg or lb. */
	interface Props {
		/** What is being chosen, for example "Units". */
		label: string;
		/** The choices, in display order. */
		options: readonly Option[];
		/** The chosen value; bind to it. */
		value: Value;
		/** Called after the user picks a different value. */
		onchange?: (value: Value) => void;
	}

	let { label, options, value = $bindable(), onchange }: Props = $props();
	const name = $props.id();

	function choose(next: Value): void {
		value = next;
		onchange?.(next);
	}
</script>

<fieldset>
	<legend>{label}</legend>
	<div class="segments">
		{#each options as option (option.value)}
			<label class:chosen={option.value === value}>
				<input
					type="radio"
					{name}
					value={option.value}
					checked={option.value === value}
					onchange={() => {
						choose(option.value);
					}}
				/>
				{option.label}
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: none;
	}

	legend {
		margin-bottom: var(--space-2);
		padding: 0;
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.segments {
		display: flex;
	}

	label {
		flex: 1;
		display: grid;
		place-items: center;
		min-height: var(--tap-target);
		margin-left: calc(-1 * var(--border-control));
		border: var(--border-control) solid var(--color-edge);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		user-select: none;
	}

	label:first-child {
		margin-left: 0;
	}

	label.chosen {
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	label:has(input:focus-visible) {
		outline: var(--focus-ring-width) solid var(--color-text);
		outline-offset: var(--focus-ring-width);
	}

	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
</style>
