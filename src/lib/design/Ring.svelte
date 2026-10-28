<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Tone } from './tone.constants.ts';

	/** Props for a circular progress meter with something in its middle. */
	interface Props {
		value: number;
		/** The target; the ring is full at or past it. */
		max: number;
		/** What the ring shows, in words, for screen readers. */
		label: string;
		tone?: Tone;
		/** Shown in the middle of the ring. */
		children: Snippet;
	}

	const { value, max, label, tone = Tone.accent, children }: Props = $props();

	const SIZE = 120;
	const CENTER = 60;
	const STROKE = 12;
	const RADIUS = 54;
	const DIAMETER = 108;
	const CIRCUMFERENCE = Math.PI * DIAMETER;

	const filled = $derived(max <= 0 ? 0 : Math.min(1, value / max) * CIRCUMFERENCE);
</script>

<div
	class="ring"
	role="meter"
	aria-label={label}
	aria-valuenow={value}
	aria-valuemin="0"
	aria-valuemax={max}
>
	<svg viewBox="0 0 {SIZE} {SIZE}" aria-hidden="true">
		<circle class="track" cx={CENTER} cy={CENTER} r={RADIUS} stroke-width={STROKE} />
		<circle
			class="fill {tone}"
			cx={CENTER}
			cy={CENTER}
			r={RADIUS}
			stroke-width={STROKE}
			stroke-dasharray="{filled} {CIRCUMFERENCE}"
			transform="rotate(-90 {CENTER} {CENTER})"
		/>
	</svg>
	<div class="middle">{@render children()}</div>
</div>

<style>
	.ring {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		max-width: 132px;
		aspect-ratio: 1;
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	circle {
		fill: none;
		stroke-linecap: round;
	}

	.track {
		stroke: var(--color-surface);
	}

	.accent {
		stroke: var(--color-accent);
	}

	.rest {
		stroke: var(--color-rest);
	}

	.protein {
		stroke: var(--color-protein);
	}

	.carbs {
		stroke: var(--color-carbs);
	}

	.fat {
		stroke: var(--color-fat);
	}

	.middle {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
</style>
