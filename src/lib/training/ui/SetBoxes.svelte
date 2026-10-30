<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';

	/** One set box: logged with its short text, or still open. */
	interface Box {
		/** The set in words, for screen readers. */
		readonly text: string;
		/** The short text in the box, such as "135×8"; undefined while open. */
		readonly short: string | undefined;
	}

	/** Props for the row of set boxes; tapping a logged set removes it. */
	interface Props {
		boxes: readonly Box[];
		onremove: (position: number) => void;
	}

	const { boxes, onremove }: Props = $props();
	const MAX_COLUMNS = 5;
	const columns = $derived(Math.min(Math.max(boxes.length, 1), MAX_COLUMNS));
	const nextOpen = $derived(boxes.findIndex((box) => box.short === undefined));
</script>

<ol class="boxes columns-{columns}" aria-label={messages.workout.sets}>
	{#each boxes as box, position (position)}
		<li>
			{#if box.short === undefined}
				<span
					class="open"
					class:next={position === nextOpen}
					aria-label={messages.workout.setOpen(position + 1)}>{position + 1}</span
				>
			{:else}
				<button
					type="button"
					aria-label={messages.workout.setLogged(position + 1, box.text)}
					onclick={() => {
						onremove(position);
					}}>{box.short}</button
				>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.boxes {
		display: grid;
		gap: var(--space-1);
	}

	.columns-1 {
		grid-template-columns: minmax(0, 1fr);
	}

	.columns-2 {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.columns-3 {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.columns-4 {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}

	.columns-5 {
		grid-template-columns: repeat(5, minmax(0, 1fr));
	}

	li {
		display: flex;
	}

	button,
	.open {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		height: var(--control-height);
		font-variant-numeric: tabular-nums;
	}

	button {
		border: none;
		background: var(--color-accent);
		color: var(--color-on-accent);
		font-size: var(--font-size-16);
		font-weight: var(--font-weight-semibold);
	}

	.open {
		border: var(--border-control) solid var(--color-edge);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.open.next {
		border-color: var(--color-text);
	}
</style>
