<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icon.constants.ts';

	/** Props for a small decorative picture: a large icon on a soft, organic shape. */
	interface Props {
		icon: IconName;
	}

	const { icon }: Props = $props();
</script>

<div class="art" aria-hidden="true">
	<span class="blob"></span>
	<span class="dot rest"></span>
	<span class="dot protein"></span>
	<span class="dot carbs"></span>
	<span class="glyph"><Icon name={icon} /></span>
</div>

<style>
	.art {
		position: relative;
		display: grid;
		place-items: center;
		width: var(--illustration-size);
		height: var(--illustration-size);
	}

	.blob {
		position: absolute;
		inset: var(--space-2);
		border-radius: var(--radius-blob);
		background: var(--color-accent-soft);
	}

	.glyph {
		position: relative;
		color: var(--color-accent);
		--icon-size: 52px;
	}

	.dot {
		position: absolute;
		border-radius: var(--radius-round);
	}

	.rest {
		top: var(--space-1);
		right: var(--space-2);
		width: var(--space-4);
		height: var(--space-4);
		background: var(--color-rest);
	}

	.protein {
		bottom: var(--space-3);
		left: 0;
		width: var(--space-3);
		height: var(--space-3);
		background: var(--color-protein);
	}

	.carbs {
		right: 0;
		bottom: var(--space-6);
		width: var(--space-2);
		height: var(--space-2);
		background: var(--color-carbs);
	}
</style>
