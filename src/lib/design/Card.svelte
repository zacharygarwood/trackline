<script lang="ts">
	import type { Snippet } from 'svelte';
	import IconBadge from './IconBadge.svelte';
	import type { IconName } from './icon.constants.ts';
	import { Tone } from './tone.constants.ts';

	/** Props for a raised card that groups one part of a screen. */
	interface Props {
		/** The card's heading. */
		title?: string;
		/** An icon shown in a colored badge before the title. */
		icon?: IconName;
		tone?: Tone;
		/** Shown at the end of the heading row, such as a link or a small action. */
		trailing?: Snippet;
		children: Snippet;
	}

	const { title, icon, tone = Tone.accent, trailing, children }: Props = $props();
</script>

<section class="card">
	{#if title !== undefined}
		<header>
			{#if icon !== undefined}
				<IconBadge {icon} {tone} />
			{/if}
			<h2>{title}</h2>
			{@render trailing?.()}
		</header>
	{/if}
	{@render children()}
</section>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-4);
		border-radius: var(--radius-card);
		background: var(--color-card);
		box-shadow: var(--shadow-card);
	}

	header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	h2 {
		flex: 1;
		font-size: var(--font-size-body);
	}
</style>
