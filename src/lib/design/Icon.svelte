<script lang="ts">
	import { ICON_PATHS, type IconName } from './icon.constants.ts';

	/** Props for an icon. Icons are decorative; label the control that contains them. */
	interface Props {
		/** Which icon to draw. */
		name: IconName;
	}

	const { name }: Props = $props();
</script>

<svg
	class="icon"
	viewBox="0 0 24 24"
	aria-hidden="true"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	<path d={ICON_PATHS[name]} />
</svg>

<style>
	.icon {
		width: var(--icon-size);
		height: var(--icon-size);
		flex-shrink: 0;
	}
</style>
