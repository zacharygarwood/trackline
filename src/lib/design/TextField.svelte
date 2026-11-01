<script lang="ts">
	/** Props for a labelled one-line text field, such as a name. */
	interface Props {
		label: string;
		/** The typed text; bind to it. */
		value: string;
		placeholder?: string | undefined;
	}

	let { label, value = $bindable(), placeholder }: Props = $props();
	const id = $props.id();
</script>

<div class="field">
	<label for={id}>{label}</label>
	<input {id} type="text" autocomplete="off" {placeholder} bind:value />
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

	input::placeholder {
		color: var(--color-placeholder);
	}
</style>
