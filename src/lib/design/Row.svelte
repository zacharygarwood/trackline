<script lang="ts">
	import type { Snippet } from 'svelte';
	import RowText from './RowText.svelte';

	/** Props for one line of a section: a label on the left and a value on the right. */
	interface Props {
		label: string;
		/** Shown dimmed after the label, such as an amount. */
		detail?: string | undefined;
		/** Shown right-aligned. */
		value?: string;
		/** Makes the line a button. */
		onclick?: () => void;
		/** Makes the line a link that opens in the browser. */
		href?: string;
		/** The accessible name when the line is a button and its text is not enough. */
		ariaLabel?: string;
		/** Draws the line in the accent color, for actions such as "Export backup". */
		action?: boolean;
		/** A control after the line, outside its button, such as a ⋯ menu. */
		end?: Snippet;
	}

	const { label, detail, value, onclick, href, ariaLabel, action = false, end }: Props = $props();
</script>

<div class="row" class:action>
	{#if href !== undefined}
		<a class="line" {href} target="_blank" rel="noopener noreferrer">
			<RowText {label} {detail} {value} />
		</a>
	{:else if onclick !== undefined}
		<button type="button" class="line" aria-label={ariaLabel} {onclick}>
			<RowText {label} {detail} {value} />
		</button>
	{:else}
		<div class="line"><RowText {label} {detail} {value} /></div>
	{/if}
	{@render end?.()}
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		min-height: var(--row-height);
	}

	.line {
		display: flex;
		flex: 1;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
		min-height: var(--row-height);
		padding: 0;
		border: none;
		background: transparent;
		color: inherit;
		text-align: left;
		text-decoration: none;
	}

	a.line,
	button.line {
		cursor: pointer;
	}

	.action {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}
</style>
