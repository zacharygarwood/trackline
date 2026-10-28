<script lang="ts">
	import { messages } from '../../i18n/messages.en.ts';
	import type { LocalDate } from '../../shared/local-date.ts';
	import { formatDate } from '../../ui/format.ts';
	import { PhotoSize } from '../application/photo-size.constants.ts';
	import type { ProgressPhoto } from '../domain/progress-photo.ts';
	import type { PhotoDay } from './photo-gallery.svelte.ts';
	import PhotoImage from './PhotoImage.svelte';
	import { POSE_LABELS } from './pose-labels.ts';

	/** Props for the gallery: thumbnails grouped under their dates. */
	interface Props {
		days: readonly PhotoDay[];
		/** Today, for "Today" and "Yesterday" labels. */
		today: LocalDate;
		imageUrl: (photo: ProgressPhoto, size: PhotoSize) => Promise<string | undefined>;
		onselect: (photo: ProgressPhoto) => void;
	}

	const { days, today, imageUrl, onselect }: Props = $props();
</script>

{#each days as day (day.date.toString())}
	{@const label = formatDate(day.date, today)}
	<section>
		<h2>{label}</h2>
		<ul>
			{#each day.photos as photo (photo.id)}
				{@const name = messages.body.photoOf(POSE_LABELS[photo.pose], label)}
				<li>
					<button
						type="button"
						aria-label={name}
						onclick={() => {
							onselect(photo);
						}}
					>
						<PhotoImage src={imageUrl(photo, PhotoSize.thumbnail)} alt="" />
					</button>
				</li>
			{/each}
		</ul>
	</section>
{/each}

<style>
	h2 {
		margin-bottom: var(--space-2);
		color: var(--color-text-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-regular);
	}

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
		aspect-ratio: 3 / 4;
		padding: 0;
		overflow: hidden;
		border: none;
		border-radius: var(--radius-medium);
		background: var(--color-surface);
		cursor: pointer;
	}
</style>
