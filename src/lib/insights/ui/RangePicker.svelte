<script lang="ts">
	import Choice from '../../design/Choice.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { STATS_RANGES } from '../application/stats-range.constants.ts';
	import type { StatsScreen } from './stats-screen.svelte.ts';

	/** Props for the 1M to All range buttons at the top of Stats and its pages. */
	interface Props {
		/** The screen whose range the buttons show and change. */
		stats: StatsScreen;
	}

	const { stats }: Props = $props();
</script>

<div class="ranges" role="group" aria-label={messages.trends.timeRange}>
	{#each STATS_RANGES as choice (choice)}
		<Choice joined pressed={stats.range === choice} onclick={() => stats.choose(choice)}
			>{messages.trends.ranges[choice]}</Choice
		>
	{/each}
</div>

<style>
	.ranges {
		position: sticky;
		top: 0;
		z-index: 1;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		margin: 0 calc(-1 * var(--gutter)) var(--space-5);
		padding: var(--space-2) var(--gutter);
		background: var(--color-background);
	}
</style>
