<script lang="ts">
	import ActionButton from '#lib/design/ActionButton.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { PhotoSize } from '#lib/tracking/application/photo-size.constants.ts';
	import type { Tracker } from '#lib/tracking/domain/tracker.ts';
	import { photoEntries } from '#lib/tracking/ui/photo-entries.ts';
	import PhotoImage from '#lib/tracking/ui/PhotoImage.svelte';
	import type { PhotoUrls } from '#lib/tracking/ui/photo-urls.ts';
	import type { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { last } from '#lib/shared/collections.ts';
	import { formatShortDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open } from '../open.ts';

	/** Props for a photo tracker's page: add a photo, the photos newest first, and compare. */
	interface Props {
		screen: TrackerScreen;
		tracker: Tracker;
		photos: PhotoUrls;
	}

	const { screen, tracker, photos }: Props = $props();
	const shots = $derived(photoEntries(screen.entries));
	const id = $props.id();
</script>

<ActionButton
	label={messages.tracking.page.addPhoto}
	icon="camera"
	onclick={() => open(AppRoute.log, { tracker: tracker.id })}
/>

{#if shots.length > 1}
	{@const newest = shots.at(0)}
	{@const oldest = last(shots)}
	{#if newest !== undefined && oldest !== undefined}
		<div class="compare">
			<NavRow
				label={messages.tracking.page.compare}
				onclick={() =>
					open(AppRoute.compare, {
						tracker: tracker.id,
						compare: [oldest.entry.id, newest.entry.id]
					})}
			/>
		</div>
	{/if}
{/if}

<SectionTitle title={messages.tracking.page.photos} {id} />
{#if shots.length === 0}
	<p class="empty">{messages.tracking.page.nothingLogged}</p>
{:else}
	<ul class="grid" aria-labelledby={id}>
		{#each shots as { entry, photoId } (entry.id)}
			{@const date = formatShortDate(entry.date)}
			<li>
				<button
					type="button"
					aria-label={messages.tracking.compare.photoOf(date)}
					onclick={() => open(AppRoute.entry, { tracker: tracker.id, entry: entry.id })}
				>
					<PhotoImage src={photos.url(photoId, PhotoSize.thumbnail)} alt="" />
				</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.compare {
		margin-top: var(--space-6);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-1);
	}

	button {
		display: block;
		width: 100%;
		aspect-ratio: 3 / 4;
		padding: 0;
		border: none;
		background: var(--color-surface);
		cursor: pointer;
	}
</style>
