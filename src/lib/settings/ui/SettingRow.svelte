<script lang="ts">
	import type { Snippet } from 'svelte';

	/** Props for one Settings row: a label on the left and its control on the right. */
	interface Props {
		label: string;
		/** The control, given the label's id for `aria-labelledby`. */
		children: Snippet<[string]>;
	}

	const { label, children }: Props = $props();
	const id = $props.id();
</script>

<div class="setting">
	<p {id}>{label}</p>
	{@render children(id)}
</div>

<style>
	.setting {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--setting-row-height);
		padding: var(--space-2) var(--gutter);
		border-bottom: var(--border-hairline) solid var(--color-divider);
	}

	p {
		flex: 1;
		font-size: var(--font-size-17);
	}
</style>
