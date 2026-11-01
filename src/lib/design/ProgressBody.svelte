<script lang="ts">
	/** Props for what a {@link ProgressRow} shows: the label, numbers, and bar or hint. */
	interface Props {
		label: string;
		value: string;
		detail: string | undefined;
		fraction: number | undefined;
		hint: string | undefined;
	}

	const { label, value, detail, fraction, hint }: Props = $props();
</script>

<span class="line">
	<span class="label">{label}</span>
	<span class="numbers"
		><span class="value">{value}</span>{#if detail !== undefined}<span class="detail">{detail}</span
			>{/if}</span
	>
</span>
{#if fraction === undefined}
	{#if hint !== undefined}<span class="hint">{hint}</span>{/if}
{:else}
	<span class="track" aria-hidden="true"
		><span class="fill" style:--fill={String(Math.min(1, Math.max(0, fraction)))}></span></span
	>
{/if}

<style>
	.line {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.label {
		font-size: var(--font-size-17);
		font-weight: var(--font-weight-medium);
	}

	.numbers {
		display: flex;
		align-items: baseline;
		font-variant-numeric: tabular-nums;
	}

	.value {
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-semibold);
		letter-spacing: var(--letter-spacing-tight);
	}

	.detail {
		margin-left: var(--chip-gap);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.hint {
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
	}

	.track {
		display: block;
		height: var(--progress-height);
		background: var(--color-surface);
	}

	.fill {
		display: block;
		width: calc(var(--fill) * 100%);
		height: 100%;
		background: var(--color-accent);
		transition: width var(--duration-quick) ease;
	}
</style>
