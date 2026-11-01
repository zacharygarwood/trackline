<script lang="ts" generics="T extends string">
	/** One choice in the list. */
	interface Option {
		readonly value: T;
		readonly label: string;
	}

	/** Props for a vertical list of choices, one chosen, for choices too many or too long for a segmented row. */
	interface Props {
		options: readonly Option[];
		value: T;
		/** The id of the label that names the list. */
		labelledBy: string;
		onchoose: (value: T) => void;
	}

	const { options, value, labelledBy, onchoose }: Props = $props();
</script>

<div class="options" role="group" aria-labelledby={labelledBy}>
	{#each options as option (option.value)}
		<button
			type="button"
			aria-pressed={option.value === value}
			onclick={() => {
				onchoose(option.value);
			}}>{option.label}</button
		>
	{/each}
</div>

<style>
	.options {
		display: flex;
		flex-direction: column;
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	button {
		min-height: var(--row-height);
		padding: 0 var(--space-4);
		border: none;
		border-bottom: var(--border-hairline) solid var(--color-divider);
		border-left: var(--tab-indicator) solid transparent;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-17);
		text-align: left;
	}

	button[aria-pressed='true'] {
		border-left-color: var(--color-accent);
		background: var(--color-surface);
		font-weight: var(--font-weight-semibold);
	}
</style>
