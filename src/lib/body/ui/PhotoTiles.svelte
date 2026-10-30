<script lang="ts">
	import { PhotoSize } from '../application/photo-size.constants.ts';
	import type { ProgressPhoto } from '../domain/progress-photo.ts';
	import PhotoImage from './PhotoImage.svelte';
	import type { PhotoGallery } from './photo-gallery.svelte.ts';

	/** One photo with its caption. */
	interface Tile {
		readonly photo: ProgressPhoto;
		readonly date: string;
		/** That day's weight, or empty. */
		readonly weight: string;
		readonly alt: string;
	}

	/** Props for progress photos in a grid, a date and weight under each. */
	interface Props {
		gallery: PhotoGallery;
		tiles: readonly Tile[];
		/** Two wide, full bleed, for comparing; otherwise three wide. */
		compare?: boolean;
	}

	const { gallery, tiles, compare = false }: Props = $props();
</script>

<div class="tiles" class:compare>
	{#each tiles as tile (tile.photo.id)}
		<figure>
			<div class="frame">
				<PhotoImage
					src={gallery.imageUrl(tile.photo, compare ? PhotoSize.full : PhotoSize.thumbnail)}
					alt={tile.alt}
				/>
			</div>
			<figcaption><span>{tile.date}</span><span class="weight">{tile.weight}</span></figcaption>
		</figure>
	{/each}
</div>

<style>
	.tiles {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--tick-gap);
	}

	.compare {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin: 0 calc(-1 * var(--gutter));
	}

	figure {
		display: flex;
		flex-direction: column;
		gap: var(--chip-gap);
		margin: 0;
		padding-bottom: var(--gap-10);
	}

	.frame {
		aspect-ratio: 3 / 4;
		background: var(--color-surface);
	}

	figcaption {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-12);
	}

	.compare figcaption {
		padding: 0 var(--gutter);
		font-size: var(--font-size-13);
	}

	.weight {
		color: var(--color-text-muted);
	}
</style>
