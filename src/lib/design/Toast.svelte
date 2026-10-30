<script lang="ts">
	/** Props for the bar that confirms what just happened, above the tab bar. */
	interface Props {
		text: string;
		/** The undo button's label, if it can be undone. */
		undo: string | undefined;
		onundo: () => void;
	}

	const { text, undo, onundo }: Props = $props();
</script>

<div class="toast">
	<p>{text}</p>
	{#if undo !== undefined}
		<button type="button" onclick={onundo}>{undo}</button>
	{/if}
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-height: var(--row-height);
		padding: 0 var(--space-2) 0 var(--gutter);
		background: var(--color-accent);
		color: var(--color-on-accent);
		animation: rise var(--duration-rise) ease-out;
	}

	p {
		flex: 1;
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	button {
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: none;
		background: transparent;
		color: inherit;
		font-size: var(--font-size-13);
		font-weight: var(--font-weight-bold);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
</style>
