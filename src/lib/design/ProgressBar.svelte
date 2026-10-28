<script lang="ts">
	import { Tone } from './tone.constants.ts';

	/** Props for a thin progress bar toward a target. */
	interface Props {
		/** The amount so far. */
		value: number;
		/** The target; the bar is full at or past it. */
		max: number;
		/** What the bar shows, in words, for screen readers. */
		label: string;
		tone?: Tone;
	}

	const { value, max, label, tone = Tone.accent }: Props = $props();

	const FULL = 100;
	const percent = $derived(max <= 0 ? 0 : Math.min(FULL, (value / max) * FULL));
	const over = $derived(max > 0 && value > max);
</script>

<svg
	class="bar"
	class:over
	viewBox="0 0 100 4"
	preserveAspectRatio="none"
	role="meter"
	aria-label={label}
	aria-valuenow={value}
	aria-valuemin="0"
	aria-valuemax={max}
>
	<rect class="track" x="0" y="0" width="100" height="4" rx="2" />
	<rect class="fill {tone}" x="0" y="0" width={percent} height="4" rx="2" />
</svg>

<style>
	.bar {
		display: block;
		width: 100%;
		height: var(--space-2);
	}

	.track {
		fill: var(--color-surface);
	}

	.accent {
		fill: var(--color-accent);
	}

	.rest {
		fill: var(--color-rest);
	}

	.protein {
		fill: var(--color-protein);
	}

	.carbs {
		fill: var(--color-carbs);
	}

	.fat {
		fill: var(--color-fat);
	}

	.over .fill {
		fill: var(--color-text-muted);
	}
</style>
