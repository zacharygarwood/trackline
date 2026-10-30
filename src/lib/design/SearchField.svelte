<script lang="ts">
	import { FieldEdges } from './button.constants.ts';
	import Icon from './Icon.svelte';
	import { IconWeight } from './icon.constants.ts';

	/** Props for a full-width search box with a magnifier, such as "Search or add food". */
	interface Props {
		/** The placeholder and the accessible name. */
		label: string;
		/** The typed text; bind to it. */
		value: string;
		/** Which edges have a divider; defaults to `both`. */
		edges?: FieldEdges;
		/** The input element; bind to it to move focus. */
		input?: HTMLInputElement | undefined;
	}

	let {
		label,
		value = $bindable(),
		edges = FieldEdges.both,
		input = $bindable()
	}: Props = $props();
</script>

<label class="search {edges}">
	<Icon name="search" weight={IconWeight.medium} />
	<span class="visually-hidden">{label}</span>
	<input bind:this={input} type="search" autocomplete="off" placeholder={label} bind:value />
</label>

<style>
	.search {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin: 0 calc(-1 * var(--gutter));
		padding: 0 var(--gutter);
		color: var(--color-text-muted);
		--icon-size: var(--icon-size-medium);
	}

	.top,
	.both {
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.bottom,
	.both {
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	input {
		flex: 1;
		min-width: 0;
		height: var(--row-height-tall);
		padding: 0;
		border: none;
		border-bottom: var(--border-field) solid transparent;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-18);
	}

	input:focus-visible {
		border-bottom-color: var(--color-text);
	}
</style>
