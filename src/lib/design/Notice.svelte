<script lang="ts">
	/** Props for a quiet one-line notice with one action. */
	interface Props {
		message: string;
		/** The action's label, for example "Reload". */
		action: string;
		onaction: () => void;
	}

	const { message, action, onaction }: Props = $props();
</script>

<div class="notice" role="status">
	<p>{message}</p>
	<button type="button" onclick={onaction}>{action}</button>
</div>

<style>
	.notice {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	button {
		flex-shrink: 0;
		min-height: var(--tap-target);
		padding: 0 var(--space-3);
		border: none;
		border-radius: var(--radius-round);
		background: var(--color-background);
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
	}
</style>
