<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonVariant } from './button.constants.ts';

	/** Props for a button; any other button attribute passes through. */
	interface Props extends Omit<HTMLButtonAttributes, 'class' | 'children'> {
		/** Visual emphasis; defaults to `primary`. */
		variant?: ButtonVariant;
		/** The button's content. */
		children: Snippet;
	}

	const {
		variant = ButtonVariant.primary,
		type = 'button',
		children,
		...attributes
	}: Props = $props();
</script>

<button class="button {variant}" {type} {...attributes}>
	{@render children()}
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-width: var(--tap-target);
		min-height: var(--button-height);
		padding: var(--space-3) var(--space-6);
		border: none;
		border-radius: var(--radius-round);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition:
			opacity var(--duration-quick),
			transform var(--duration-quick);
	}

	.button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.button:active:not(:disabled) {
		transform: scale(0.97);
	}

	.primary {
		background: var(--color-accent);
		color: var(--color-on-accent);
		box-shadow: var(--shadow-button);
	}

	.secondary {
		background: var(--color-accent-soft);
		color: var(--color-on-accent-soft);
	}

	.quiet {
		background: transparent;
		color: var(--color-accent);
	}
</style>
