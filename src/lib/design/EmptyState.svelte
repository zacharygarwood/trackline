<script lang="ts">
	import type { Snippet } from 'svelte';
	import Illustration from './Illustration.svelte';
	import type { IconName } from './icon.constants.ts';

	/** Props for the placeholder shown when a list has nothing in it yet. */
	interface Props {
		/** One or two plain sentences saying what belongs here. */
		message: string;
		/** The picture above the message: what the list will hold. */
		icon?: IconName;
		/** The one action that fills the list, if any. */
		action?: Snippet;
	}

	const { message, icon, action }: Props = $props();
</script>

<div class="empty-state">
	{#if icon !== undefined}
		<Illustration {icon} />
	{/if}
	<p>{message}</p>
	{@render action?.()}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-8) var(--space-6);
		color: var(--color-text-muted);
		text-align: center;
	}

	p {
		max-width: 28ch;
	}
</style>
