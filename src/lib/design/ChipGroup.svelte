<script lang="ts" generics="Value extends string">
	import Choice from './Choice.svelte';

	/** One choice in a chip group. */
	interface Option {
		readonly value: Value;
		readonly label: string;
	}

	/** Props for a labelled group of choices that wraps onto more lines, such as what a goal counts. */
	interface Props {
		label: string;
		options: readonly Option[];
		value: Value | undefined;
		onchoose: (value: Value) => void;
	}

	const { label, options, value, onchoose }: Props = $props();
	const id = $props.id();
</script>

<div class="group">
	<p {id}>{label}</p>
	<div class="chips" role="group" aria-labelledby={id}>
		{#each options as option (option.value)}
			<Choice
				pressed={option.value === value}
				onclick={() => {
					onchoose(option.value);
				}}>{option.label}</Choice
			>
		{/each}
	</div>
</div>

<style>
	p {
		margin-bottom: var(--space-2);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
