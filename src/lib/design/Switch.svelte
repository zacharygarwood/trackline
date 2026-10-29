<script lang="ts">
	/** Props for a labelled on/off row, such as "Rest day". */
	interface Props {
		label: string;
		checked: boolean;
		/** Called when the user flips the switch. */
		ontoggle: () => void;
	}

	const { label, checked, ontoggle }: Props = $props();
</script>

<button type="button" role="switch" aria-checked={checked} onclick={ontoggle}>
	<span>{label}</span>
	<span class="track" class:checked aria-hidden="true"><span class="thumb"></span></span>
</button>

<style>
	button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--row-height);
		padding: 0;
		border: none;
		background: transparent;
		text-align: left;
		cursor: pointer;
	}

	.track {
		display: flex;
		align-items: center;
		width: var(--space-12);
		height: var(--space-6);
		padding: var(--space-1);
		border-radius: var(--radius-round);
		background: var(--color-text-muted);
		transition: background var(--duration-quick);
	}

	.thumb {
		width: var(--space-4);
		height: var(--space-4);
		border-radius: var(--radius-round);
		background: var(--color-background);
		transition: transform var(--duration-quick);
	}

	.checked {
		background: var(--color-rest);
	}

	.checked .thumb {
		transform: translateX(var(--space-6));
	}
</style>
