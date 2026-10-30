<script lang="ts" generics="Value extends string | number">
	import Choice from '../../design/Choice.svelte';

	/** One choice in a Settings row. */
	interface Option {
		readonly value: Value;
		readonly label: string;
	}

	/** Props for joined choices in a Settings row, such as lb and kg. */
	interface Props {
		/** The id of the row's label. */
		labelledBy: string;
		options: readonly Option[];
		value: Value;
		onchoose: (value: Value) => void;
	}

	const { labelledBy, options, value, onchoose }: Props = $props();
</script>

<div role="group" aria-labelledby={labelledBy}>
	{#each options as option (option.value)}
		<Choice
			joined
			pressed={option.value === value}
			onclick={() => {
				onchoose(option.value);
			}}>{option.label}</Choice
		>
	{/each}
</div>

<style>
	div {
		display: flex;
	}
</style>
