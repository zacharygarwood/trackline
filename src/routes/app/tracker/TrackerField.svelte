<script lang="ts">
	import { InputMode } from '#lib/design/html.constants.ts';

	/** Props for one labelled field of the tracker form. */
	interface Props {
		id: string;
		label: string;
		value: string;
		placeholder?: string;
		/** Whether the field takes a number. */
		numeric?: boolean;
	}

	let { id, label, value = $bindable(), placeholder, numeric = false }: Props = $props();
</script>

<div class="field">
	<label for={id}>{label}</label>
	<input
		{id}
		type="text"
		inputmode={numeric ? InputMode.decimal : undefined}
		autocomplete="off"
		{placeholder}
		bind:value
	/>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
	}

	label {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	input {
		width: 100%;
		height: var(--button-height);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid var(--color-field-line);
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-semibold);
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}
</style>
