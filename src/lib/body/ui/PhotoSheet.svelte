<script lang="ts">
	import Button from '../../design/Button.svelte';
	import { ButtonVariant } from '../../design/button.constants.ts';
	import Sheet from '../../design/Sheet.svelte';
	import { messages } from '../../i18n/messages.en.ts';
	import { formatDate } from '../../ui/format.ts';
	import { PhotoSize } from '../application/photo-size.constants.ts';
	import type { ProgressPhoto } from '../domain/progress-photo.ts';
	import PhotoCompare from './PhotoCompare.svelte';
	import { photosByDay, type PhotoGallery } from './photo-gallery.svelte.ts';
	import PhotoGrid from './PhotoGrid.svelte';
	import PhotoImage from './PhotoImage.svelte';
	import { POSE_LABELS } from './pose-labels.ts';

	/** Props for the sheet showing one photo, with Compare and Delete. */
	interface Props {
		photo: ProgressPhoto;
		gallery: PhotoGallery;
		onclose: () => void;
	}

	const { photo, gallery, onclose }: Props = $props();

	let open = $state(true);
	let choosing = $state(false);
	let other: ProgressPhoto | undefined = $state();

	const labelOf = (shown: ProgressPhoto) =>
		messages.body.photoOf(POSE_LABELS[shown.pose], formatDate(shown.date, gallery.today));
	const candidates = $derived(gallery.comparableWith(photo));
	const candidateDays = $derived(photosByDay(candidates));

	$effect(() => {
		if (!open) onclose();
	});

	async function remove(): Promise<void> {
		await gallery.remove(photo);
		open = false;
	}

	async function compared(first: ProgressPhoto, second: ProgressPhoto) {
		const [older, newer] = first.date.isBefore(second.date) ? [first, second] : [second, first];
		const [olderUrl, newerUrl] = await Promise.all([
			gallery.imageUrl(older, PhotoSize.full),
			gallery.imageUrl(newer, PhotoSize.full)
		]);
		const side = (shown: ProgressPhoto, url: string) => ({
			url,
			label: labelOf(shown),
			width: shown.width,
			height: shown.height
		});
		return olderUrl === undefined || newerUrl === undefined
			? undefined
			: { before: side(older, olderUrl), after: side(newer, newerUrl) };
	}
</script>

<Sheet bind:open title={other === undefined ? labelOf(photo) : messages.body.compare}>
	{#if other !== undefined}
		{#await compared(photo, other) then sides}
			{#if sides !== undefined}
				<PhotoCompare before={sides.before} after={sides.after} />
			{/if}
		{/await}
	{:else if choosing}
		<h3>{messages.body.compareWith}</h3>
		{#if candidates.length === 0}
			<p class="note">{messages.body.noOtherPhotos(POSE_LABELS[photo.pose])}</p>
		{:else}
			<div class="choices">
				<PhotoGrid
					days={candidateDays}
					today={gallery.today}
					imageUrl={gallery.imageUrl}
					onselect={(shown: ProgressPhoto) => {
						other = shown;
					}}
				/>
			</div>
		{/if}
	{:else}
		<div class="photo">
			<PhotoImage src={gallery.imageUrl(photo, PhotoSize.full)} alt={labelOf(photo)} whole />
		</div>
		<Button onclick={() => (choosing = true)}>{messages.body.compare}</Button>
		<Button variant={ButtonVariant.quiet} onclick={remove}>{messages.body.deletePhoto}</Button>
	{/if}
</Sheet>

<style>
	.photo {
		overflow: hidden;
		border-radius: var(--radius-medium);
		background: var(--color-surface);
	}

	h3 {
		font-size: var(--font-size-body);
	}

	.note {
		color: var(--color-text-muted);
	}

	.choices {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		overflow-y: auto;
	}
</style>
