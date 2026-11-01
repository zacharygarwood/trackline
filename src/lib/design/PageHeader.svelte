<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icon.constants.ts';

	/** Props for the top of a page: the page's title, after a back link unless it is a tab. */
	interface Props {
		/** Where the back link goes; a tab page has none. */
		backHref?: string | undefined;
		/** The back link's text, such as "← Food". */
		backLabel?: string | undefined;
		title: string;
		/** Goes back in history instead of following the link, so the page before keeps its state. */
		onback?: (() => void) | undefined;
		/** A quiet icon button across from the back link, such as for editing what the page shows. */
		actionIcon?: IconName | undefined;
		/** The icon button's accessible name, such as "Edit tracker". */
		actionLabel?: string | undefined;
		/** Runs when the icon button is tapped; without it there is no button. */
		onaction?: (() => void) | undefined;
	}

	const { backHref, backLabel, title, onback, actionIcon, actionLabel, onaction }: Props = $props();

	function back(event: MouseEvent): void {
		if (onback === undefined) return;
		event.preventDefault();
		onback();
	}
</script>

{#if backHref !== undefined}
	<div class="top">
		<a class="back" href={backHref} onclick={back}>{backLabel}</a>
		{#if onaction !== undefined && actionIcon !== undefined}
			<button type="button" class="action" aria-label={actionLabel} onclick={onaction}
				><Icon name={actionIcon} /></button
			>
		{/if}
	</div>
{/if}
<h1 class:tab={backHref === undefined}>{title}</h1>

<style>
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.action {
		display: grid;
		place-items: center;
		width: var(--tap-target);
		height: var(--tap-target);
		margin-right: calc(-1 * var(--space-3));
		border: none;
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		view-transition-name: header-action;
		--icon-size: var(--icon-size-header);
	}

	.back {
		display: flex;
		align-items: center;
		align-self: flex-start;
		min-height: var(--tap-target);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	h1 {
		margin: var(--space-2) 0 var(--space-4);
		font-size: var(--font-size-22);
		font-weight: var(--font-weight-semibold);
	}

	h1.tab {
		margin-top: var(--space-4);
		font-size: var(--font-size-26);
		letter-spacing: var(--letter-spacing-tight);
	}
</style>
