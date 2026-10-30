<script lang="ts">
	/** Props for a labelled on/off row, such as "Carbs and fat". */
	interface Props {
		label: string;
		checked: boolean;
		/** Called when the user flips the switch. */
		ontoggle: () => void;
	}

	const { label, checked, ontoggle }: Props = $props();
	const labelId = $props.id();
</script>

<div class="row">
	<p id={labelId}>{label}</p>
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		aria-labelledby={labelId}
		class:checked
		onclick={ontoggle}
	>
		<span class="thumb"></span>
	</button>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: var(--setting-row-height);
	}

	p {
		font-size: var(--font-size-17);
	}

	button {
		position: relative;
		width: var(--switch-width);
		height: var(--switch-height);
		padding: 0;
		border: var(--border-control) solid var(--color-field-line);
		background: transparent;
		transition: background var(--duration-quick) ease;
	}

	.thumb {
		position: absolute;
		top: var(--switch-inset);
		left: var(--switch-inset);
		width: var(--switch-thumb);
		height: var(--switch-thumb);
		background: var(--color-text-muted);
		transition: transform var(--duration-quick) ease;
	}

	.checked {
		border-color: var(--color-accent);
		background: var(--color-accent);
	}

	.checked .thumb {
		background: var(--color-on-accent);
		transform: translateX(var(--switch-travel));
	}
</style>
