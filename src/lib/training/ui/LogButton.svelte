<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';

	/** Props for the big log button, which counts down the rest after a set. */
	interface Props {
		/** "Log set", "Done", or "Log". */
		label: string;
		/** The rest countdown, such as "1:23", while resting. */
		rest: string | undefined;
		/** How much of the rest is left, from 1 to 0. */
		restShare: number;
		onlog: () => void;
		onskip: () => void;
	}

	const { label, rest, restShare, onlog, onskip }: Props = $props();
	const PERCENT = 100;
</script>

<button
	type="button"
	class:resting={rest !== undefined}
	onclick={rest === undefined ? onlog : onskip}
>
	{#if rest !== undefined}
		<svg aria-hidden="true" preserveAspectRatio="none"
			><rect width="{restShare * PERCENT}%" height="100%" /></svg
		>
	{/if}
	<span class="text">
		{#if rest === undefined}
			<span>{label}</span>
		{:else}
			<span>{messages.workout.rest(rest)}</span>
			<span class="hint">{messages.workout.skip}</span>
		{/if}
	</span>
</button>

<style>
	button {
		position: relative;
		height: var(--log-button-height);
		overflow: hidden;
		border: none;
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-semibold);
	}

	.resting {
		background: var(--color-surface);
		color: var(--color-text);
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	rect {
		fill: var(--color-surface-strong);
		transition: width var(--duration-rest) linear;
	}

	.text {
		position: relative;
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: var(--gap-14);
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}
</style>
