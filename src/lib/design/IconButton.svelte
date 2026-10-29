<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icon.constants.ts';

	/** Props for a small borderless button showing only an icon, such as + in a section label. */
	interface Props {
		/** What the button does, for screen readers. */
		label: string;
		icon: IconName;
		onclick: () => void;
	}

	const { label, icon, onclick }: Props = $props();
</script>

<button type="button" aria-label={label} {onclick}>
	<Icon name={icon} />
</button>

<style>
	button {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-3)) calc(-1 * var(--space-3)) 0;
		padding: 0;
		border: none;
		border-radius: var(--radius-small);
		background: transparent;
		color: var(--color-accent);
		cursor: pointer;
	}
</style>
