<script lang="ts">
	/** Props for the text of a {@link Row}: label, optional dimmed detail, optional right-aligned value. */
	interface Props {
		label: string;
		detail: string | undefined;
		value: string | undefined;
	}

	const { label, detail, value }: Props = $props();
</script>

<span class="label">{label}</span>
{#if detail !== undefined}<span class="detail">{detail}</span>{/if}
{#if value !== undefined}<span class="value">{value}</span>{/if}

<style>
	.label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail {
		flex-shrink: 0;
		color: var(--color-text-muted);
	}

	.value {
		flex-shrink: 0;
		margin-left: auto;
		padding-left: var(--space-3);
		text-align: right;
	}
</style>
