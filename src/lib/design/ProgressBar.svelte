<script lang="ts">
	import { filledTicks } from './progress-ticks.ts';
	import { TickSize } from './tick-size.constants.ts';

	/** Props for a row of 40 ticks filling toward a target. Decorative when inside a labelled control. */
	interface Props {
		/** The amount so far. */
		value: number;
		/** The target; every tick is filled at or past it. */
		max: number;
		/** Defaults to `regular`. */
		size?: TickSize;
	}

	const { value, max, size = TickSize.regular }: Props = $props();

	const TICKS = 40;
	const filled = $derived(filledTicks({ value, max, ticks: TICKS }));
</script>

<span class="bar {size}" aria-hidden="true">
	{#each { length: TICKS }, tick (tick)}
		<span class:filled={tick < filled}></span>
	{/each}
</span>

<style>
	.bar {
		display: grid;
		grid-template-columns: repeat(40, minmax(0, 1fr));
		gap: var(--tick-gap);
		width: 100%;
	}

	.hero {
		height: var(--tick-height-hero);
	}

	.food {
		height: var(--tick-height-food);
	}

	.regular {
		height: var(--tick-height);
	}

	.small {
		height: var(--tick-height-small);
	}

	span span {
		background: var(--color-empty);
	}

	span .filled {
		background: var(--color-accent);
	}
</style>
