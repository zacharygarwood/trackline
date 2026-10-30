<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChoiceSize } from './button.constants.ts';

	/** Props for one option of a group, filled with the accent while chosen. */
	interface Props {
		/** Whether this option is chosen. */
		pressed: boolean;
		onclick: () => void;
		/** Draws the option against its neighbours, sharing their borders. */
		joined?: boolean;
		/** Defaults to `regular`. */
		size?: ChoiceSize;
		/** The accessible name, when the content is not text. */
		ariaLabel?: string | undefined;
		children: Snippet;
	}

	const {
		pressed,
		onclick,
		joined = false,
		size = ChoiceSize.regular,
		ariaLabel,
		children
	}: Props = $props();
</script>

<button
	type="button"
	class="choice {size}"
	class:joined
	class:pressed
	aria-pressed={pressed}
	aria-label={ariaLabel}
	{onclick}
>
	{@render children()}
</button>

<style>
	.choice {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--chip-gap);
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
		font-weight: var(--font-weight-semibold);
		white-space: nowrap;
	}

	.regular {
		min-width: var(--tap-target);
		height: var(--tap-target);
		padding: 0 var(--space-3);
		font-size: var(--font-size-15);
	}

	.large {
		min-height: var(--control-height);
		padding: 0 var(--space-4);
		font-size: var(--font-size-16);
	}

	.joined:not(:first-child) {
		margin-left: calc(-1 * var(--border-control));
	}

	.pressed {
		position: relative;
		border-color: var(--color-accent);
		background: var(--color-accent);
		color: var(--color-on-accent);
	}
</style>
