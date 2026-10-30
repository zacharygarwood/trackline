<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { ButtonSize, ButtonVariant } from './button.constants.ts';

	/** Props for a square button; any other button attribute passes through. */
	interface Props extends Omit<HTMLButtonAttributes, 'class' | 'children'> {
		/** Visual emphasis; defaults to `primary`. */
		variant?: ButtonVariant;
		/** Height; defaults to `regular` (56 px). */
		size?: ButtonSize;
		/** The button's content. */
		children: Snippet;
	}

	const {
		variant = ButtonVariant.primary,
		size = ButtonSize.regular,
		type = 'button',
		children,
		...attributes
	}: Props = $props();
</script>

<button class="button {variant} {size}" {type} {...attributes}>
	{@render children()}
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--chip-gap);
		padding: 0 var(--space-5);
		border: none;
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-semibold);
	}

	.button:disabled {
		opacity: 0.35;
	}

	.compact {
		min-height: var(--control-height);
	}

	.medium {
		min-height: var(--field-height);
	}

	.regular {
		min-height: var(--button-height);
	}

	.tall {
		min-height: var(--log-button-height);
	}

	.primary {
		background: var(--color-accent);
		color: var(--color-on-accent);
	}

	.secondary {
		border: var(--border-control) solid var(--color-edge);
		background: transparent;
		color: var(--color-text);
	}

	.quiet {
		min-height: var(--tap-target);
		padding: 0;
		background: transparent;
		color: var(--color-accent);
		font-size: var(--font-size-15);
	}
</style>
