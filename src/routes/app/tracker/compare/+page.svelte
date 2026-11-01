<script lang="ts">
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { PhotoSize } from '#lib/tracking/application/photo-size.constants.ts';
	import type { EntryId } from '#lib/tracking/domain/ids.ts';
	import { photoEntries, type PhotoEntry } from '#lib/tracking/ui/photo-entries.ts';
	import PhotoImage from '#lib/tracking/ui/PhotoImage.svelte';
	import { PhotoUrls } from '#lib/tracking/ui/photo-urls.ts';
	import { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { first, last } from '#lib/shared/collections.ts';
	import { formatShortDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, replace } from '../../open.ts';

	const preferences = getPreferences();
	let screen: TrackerScreen | undefined = $state();
	let photos: PhotoUrls | undefined = $state();
	let before: string | undefined = $state(first(page.state.compare ?? []));
	let after: string | undefined = $state(last(page.state.compare ?? []));

	void getAppContext().then(async (app) => {
		const next = new TrackerScreen(app.tracking, app.clock, preferences.weekStart);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		photos = new PhotoUrls(app.tracking.getPhotoImage);
		screen = next;
	});

	onDestroy(() => void photos?.clear());

	const shots = $derived(photoEntries(screen?.entries ?? []));
	const find = (id: string | undefined): PhotoEntry | undefined =>
		shots.find((shot) => shot.entry.id === id);
	const sides = $derived([
		{
			label: messages.tracking.compare.before,
			shot: find(before),
			choose: (id: EntryId) => (before = id)
		},
		{
			label: messages.tracking.compare.after,
			shot: find(after),
			choose: (id: EntryId) => (after = id)
		}
	]);
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={messages.tracking.compare.title}
	onback={back}
/>

{#if photos !== undefined && shots.length > 1}
	{@const urls = photos}
	<div class="sides">
		{#each sides as side (side.label)}
			<div class="side">
				<div class="photo">
					{#if side.shot !== undefined}
						<PhotoImage
							src={urls.url(side.shot.photoId, PhotoSize.full)}
							alt={messages.tracking.compare.photoOf(formatShortDate(side.shot.entry.date))}
						/>
					{/if}
				</div>
				<label>
					<span>{side.label}</span>
					<select
						value={side.shot?.entry.id}
						onchange={(event) => {
							const chosen = shots.find((shot) => shot.entry.id === event.currentTarget.value);
							if (chosen !== undefined) side.choose(chosen.entry.id);
						}}
					>
						{#each shots as shot (shot.entry.id)}
							<option value={shot.entry.id}>{formatShortDate(shot.entry.date)}</option>
						{/each}
					</select>
				</label>
			</div>
		{/each}
	</div>
{:else if screen !== undefined}
	<p class="empty">{messages.tracking.compare.choose}</p>
{/if}

<style>
	.sides {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2);
	}

	.photo {
		aspect-ratio: 3 / 4;
		background: var(--color-surface);
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-top: var(--space-2);
		font-size: var(--font-size-13);
		font-weight: var(--font-weight-semibold);
	}

	select {
		height: var(--control-height);
		border: var(--border-control) solid var(--color-edge);
		background: var(--color-background);
		color: var(--color-text);
		font: inherit;
		font-size: var(--font-size-15);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
