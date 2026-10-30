<script lang="ts">
	import { layoutTrendLine } from './trend-line.ts';

	/** Props for a small decorative line with a square on its newest value; describe it in nearby text. */
	interface Props {
		/** The values, oldest first; at least one. */
		values: readonly number[];
		/** Extra range above and below the values, in their unit. */
		padding: number;
	}

	const { values, padding }: Props = $props();

	const WIDTH = 140;
	const LINE_WIDTH = 134;
	const HEIGHT = 48;
	const MARKER = 6;

	const line = $derived(
		layoutTrendLine({ values, padding, width: LINE_WIDTH, height: HEIGHT, marker: MARKER })
	);
</script>

<svg viewBox="0 0 {WIDTH} {HEIGHT}" width={WIDTH} height={HEIGHT} aria-hidden="true">
	<polyline points={line.points} />
	<rect x={line.markerX} y={line.markerY} width={MARKER} height={MARKER} />
</svg>

<style>
	svg {
		display: block;
		flex-shrink: 0;
		overflow: visible;
	}

	polyline {
		fill: none;
		stroke: var(--color-accent);
		stroke-width: 2;
	}

	rect {
		fill: var(--color-accent);
	}
</style>
