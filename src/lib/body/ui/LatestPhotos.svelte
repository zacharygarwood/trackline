<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Card from '../../design/Card.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { formatDate } from '../../ui/format.ts';
	import { PhotoSize } from '../application/photo-size.constants.ts';
	import AddPhotoButton from './AddPhotoButton.svelte';
	import type { PhotoGallery } from './photo-gallery.svelte.ts';
	import PhotoImage from './PhotoImage.svelte';
	import { POSE_LABELS } from './pose-labels.ts';

	/** Props for the Body tab's progress photo section. */
	interface Props {
		gallery: PhotoGallery;
		/** The link to the whole gallery, shown once there are photos. */
		allPhotos: Snippet;
		/** Opens the gallery. */
		onopen: () => void;
	}

	const { gallery, allPhotos, onopen }: Props = $props();

	const SHOWN = 3;
	const latest = $derived(gallery.photos.slice(0, SHOWN));
</script>

<Card title={messages.body.progressPhotos}>
	{#snippet trailing()}
		{#if latest.length > 0}
			{@render allPhotos()}
		{/if}
	{/snippet}
	{#if latest.length > 0}
		<ul>
			{#each latest as photo (photo.id)}
				<li>
					<button
						type="button"
						onclick={onopen}
						aria-label={messages.body.photoOf(
							POSE_LABELS[photo.pose],
							formatDate(photo.date, gallery.today)
						)}
					>
						<PhotoImage src={gallery.imageUrl(photo, PhotoSize.thumbnail)} alt="" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
	<AddPhotoButton {gallery} variant={ButtonVariant.secondary} />
</Card>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	button {
		display: block;
		width: 100%;
		padding: 0;
		border: none;
		cursor: pointer;
		aspect-ratio: 3 / 4;
		overflow: hidden;
		border-radius: var(--radius-small);
		background: var(--color-surface);
	}
</style>
