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
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
	}

	.segments {
		display: flex;
		gap: var(--space-1);
		padding: var(--space-1);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	label {
		flex: 1;
		display: grid;
		place-items: center;
		min-height: var(--tap-target);
		border-radius: var(--radius-small);
		cursor: pointer;
		user-select: none;
	}

	label.chosen {
		background: var(--color-card);
		font-weight: var(--font-weight-semibold);
	}

	label:has(input:focus-visible) {
		outline: var(--focus-ring-width) solid var(--color-accent);
	}

	input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}
</style>
