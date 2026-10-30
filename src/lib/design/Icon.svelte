<script lang="ts">
	import { ICON_PATHS, ICON_STROKE, IconWeight, type IconName } from './icon.constants.ts';

	/** Props for an icon. Icons are decorative; label the control that contains them. */
	interface Props {
		/** Which icon to draw. */
		name: IconName;
		/** The stroke; defaults to `regular`. */
		weight?: IconWeight;
	}

	const { name, weight = IconWeight.regular }: Props = $props();
</script>

<svg
	class="icon"
	viewBox="0 0 24 24"
	aria-hidden="true"
	fill="none"
	stroke="currentColor"
	stroke-width={ICON_STROKE[weight]}
	stroke-linecap="square"
	stroke-linejoin="miter"
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
