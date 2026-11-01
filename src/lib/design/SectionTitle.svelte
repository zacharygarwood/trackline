<script lang="ts">
	/** Props for the heading over a section of rows, such as "History". */
	interface Props {
		title: string;
		/** The heading's id, for the list it names. */
		id?: string | undefined;
	}

	const { title, id }: Props = $props();
</script>

<h2 {id}>{title}</h2>

<style>
	h2 {
		margin-top: var(--space-8);
		padding-bottom: var(--space-3);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}
</style>
