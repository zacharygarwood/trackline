<script lang="ts">
	/** Props for one label and value pair; place rows inside a `<dl>`. */
	interface Props {
		label: string;
		/** Shown right-aligned in the number font. */
		value: string;
	}

	const { label, value }: Props = $props();
</script>

<div class="row">
	<dt>{label}</dt>
	<dd>{value}</dd>
</div>

<style>
	.row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-1) 0;
	}

	dt {
		color: var(--color-text-muted);
	}

	dd {
		margin: 0;
		font-family: var(--font-mono);
		text-align: right;
	}
</style>
