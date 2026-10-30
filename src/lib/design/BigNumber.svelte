<script lang="ts">
	import { NumberSize } from './big-number.constants.ts';

	/** Props for a large bold number with a dimmed suffix, such as "1,359 / 2,200". */
	interface Props {
		/** The number, already formatted. */
		value: string;
		/** Shown after the number, such as "/ 2,200 kcal" or "lb". */
		suffix?: string | undefined;
		/** Shown after the suffix in the accent color, such as "−1.4". */
		note?: string | undefined;
		/** Defaults to `stat`. */
		size?: NumberSize;
	}

	const { value, suffix, note, size = NumberSize.stat }: Props = $props();
</script>

<p class="big-number {size}">
	{value}{#if suffix !== undefined}<span class="suffix">{suffix}</span
		>{/if}{#if note !== undefined && note !== ''}<span class="note">{note}</span>{/if}
</p>

<style>
	.big-number {
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-number);
		letter-spacing: var(--letter-spacing-number);
		font-variant-numeric: tabular-nums;
	}

	.suffix,
	.note {
		margin-left: var(--space-3);
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0;
	}

	.suffix {
		margin-left: var(--suffix-gap);
		color: var(--color-text-muted);
	}

	.note {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	.hero {
		font-size: var(--font-size-72);
		letter-spacing: var(--letter-spacing-hero);
	}

	.hero .suffix {
		font-size: var(--font-size-22);
	}

	.large {
		font-size: var(--font-size-56);
		letter-spacing: var(--letter-spacing-hero);
	}

	.stat {
		font-size: var(--font-size-44);
	}

	.macro {
		font-size: var(--font-size-40);
	}

	.macro .suffix {
		font-size: var(--font-size-18);
	}

	.figure {
		font-size: var(--font-size-30);
		letter-spacing: var(--letter-spacing-figure);
	}

	.figure .suffix {
		margin-left: var(--space-2);
		font-size: var(--font-size-16);
	}
</style>
