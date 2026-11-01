<script lang="ts">
	/** Props for an image that loads from the photo store. */
	interface Props {
		/** Resolves to the image URL, or undefined if the file is missing. */
		src: Promise<string | undefined>;
		/** Describes the photo. */
		alt: string;
		/** Show the whole image instead of filling the box. */
		whole?: boolean;
	}

	const { src, alt, whole = false }: Props = $props();
</script>

{#await src then url}
	{#if url !== undefined}
		<img src={url} {alt} class:whole />
	{/if}
{/await}

<style>
	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.whole {
		max-height: 60dvh;
		object-fit: contain;
	}
</style>
