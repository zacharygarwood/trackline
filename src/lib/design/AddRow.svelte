<script lang="ts">
	import Icon from './Icon.svelte';

	/** Props for a left-aligned "+ label" text button at the end of a list, such as "Add set". */
	interface Props {
		label: string;
		onclick: () => void;
	}

	const { label, onclick }: Props = $props();
</script>

<button type="button" {onclick}><Icon name="plus" />{label}</button>

<style>
	button {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		align-self: flex-start;
		min-height: var(--tap-target);
		padding: 0;
		border: none;
		background: transparent;
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		--icon-size: 20px;
	}
</style>
