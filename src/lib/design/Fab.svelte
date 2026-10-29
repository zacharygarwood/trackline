<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icon.constants.ts';

	/** Props for the screen's main add action, floating above the tab bar. */
	interface Props {
		/** What the button does, for screen readers, for example "Log food". */
		label: string;
		icon?: IconName;
		onclick: () => void;
	}

	const { label, icon = 'plus', onclick }: Props = $props();
</script>

<button type="button" class="fab" aria-label={label} {onclick}>
	<Icon name={icon} />
</button>

<style>
	.fab {
		position: fixed;
		right: max(var(--space-4), calc((100vw - var(--content-max-width)) / 2 + var(--space-4)));
		bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom) + var(--space-4));
		z-index: 1;
		display: grid;
		place-items: center;
		width: var(--fab-size);
		height: var(--fab-size);
		padding: 0;
		border: none;
		border-radius: var(--radius-large);
		background: var(--color-accent);
		color: var(--color-on-accent);
		box-shadow: var(--shadow-fab);
		cursor: pointer;
		--icon-size: 28px;
	}

	.fab:active {
		opacity: 0.8;
	}
</style>
