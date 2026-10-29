<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import AddPhotoButton from '#lib/body/ui/AddPhotoButton.svelte';
	import { ObjectUrls } from '#lib/body/ui/object-urls.ts';
	import { PhotoGallery } from '#lib/body/ui/photo-gallery.svelte.ts';
	import PhotoGrid from '#lib/body/ui/PhotoGrid.svelte';
	import PhotoSheet from '#lib/body/ui/PhotoSheet.svelte';
	import type { ProgressPhoto } from '#lib/body/domain/progress-photo.ts';
	import EmptyState from '#lib/design/EmptyState.svelte';
	import Fab from '#lib/design/Fab.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';

	let gallery: PhotoGallery | undefined = $state();
	let selected: ProgressPhoto | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new PhotoGallery(app.body, app.clock, new ObjectUrls());
		await next.load();
		gallery = next;
	});

	$effect(() => () => {
		void gallery?.dispose();
	});
</script>

{#if gallery !== undefined}
	{@const ready = gallery}
	<div class="photos">
		{#if ready.photos.length === 0}
			<EmptyState message={messages.body.noPhotos} />
		{:else}
			<PhotoGrid
				days={ready.days}
				today={ready.today}
				imageUrl={ready.imageUrl}
				onselect={(photo: ProgressPhoto) => {
					selected = photo;
				}}
			/>
		{/if}
	</div>
	<AddPhotoButton gallery={ready}>
		{#snippet trigger(pick: () => void)}
			<Fab label={messages.body.addPhoto} onclick={pick} />
		{/snippet}
	</AddPhotoButton>

	{#if selected !== undefined}
		{#key selected.id}
			<PhotoSheet
				photo={selected}
				gallery={ready}
				onclose={() => {
					selected = undefined;
				}}
			/>
		{/key}
	{/if}
{/if}

<style>
	.photos {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
	}
</style>
