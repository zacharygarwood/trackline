<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import { CheckIn, type CheckInResult } from '#lib/body/ui/check-in.svelte.ts';
	import CheckInForm from '#lib/body/ui/CheckInForm.svelte';
	import { ObjectUrls } from '#lib/body/ui/object-urls.ts';
	import { photoTiles } from '#lib/body/ui/body-trends.ts';
	import { PhotoGallery } from '#lib/body/ui/photo-gallery.svelte.ts';
	import PhotoTiles from '#lib/body/ui/PhotoTiles.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { unitLabel } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';

	/** How many of the latest photos show on the Weight tab: two rows of three. */
	const PREVIEW_PHOTOS = 6;
	const preferences = getPreferences();
	const toaster = getToaster();
	let body: BodyScreen | undefined = $state();
	let gallery: PhotoGallery | undefined = $state();
	let checkIn: CheckIn | undefined = $state();

	void getAppContext().then(async (app) => {
		const nextBody = new BodyScreen(
			{ ...app.body, getMassUnit: app.settings.getMassUnit },
			app.clock
		);
		const photos = new PhotoGallery(app.body, app.clock, new ObjectUrls());
		await Promise.all([nextBody.load(), photos.load()]);
		const next = new CheckIn(nextBody, photos);
		next.prefill();
		body = nextBody;
		gallery = photos;
		checkIn = next;
	});

	$effect(() => () => {
		void gallery?.dispose();
	});

	function saved(result: CheckInResult): void {
		toaster.show(result.message, result.undo);
	}
</script>

<PageHeader title={messages.home.weight} />

{#if body !== undefined && gallery !== undefined && checkIn !== undefined}
	<div class="check-in">
		<CheckInForm {checkIn} unit={unitLabel(preferences.massUnit)} onsaved={saved} />
	</div>

	<h2 id="weight-photos">{messages.checkIn.photos}</h2>
	{#if gallery.photos.length === 0}
		<p class="empty">{messages.checkIn.noPhotos}</p>
	{:else}
		<section aria-labelledby="weight-photos">
			<PhotoTiles
				{gallery}
				tiles={photoTiles(gallery.photos, body.weighIns, preferences.massUnit).slice(
					0,
					PREVIEW_PHOTOS
				)}
			/>
		</section>
		<div class="more">
			{#if gallery.photos.length > PREVIEW_PHOTOS}
				<NavRow label={messages.checkIn.allPhotos} href={resolve(AppRoute.photos)} />
			{/if}
			{#if gallery.photos.length > 1}
				<NavRow label={messages.navigation.compare} href={resolve(AppRoute.compare)} />
			{/if}
		</div>
	{/if}
{/if}

<style>
	.check-in {
		margin-bottom: var(--space-5);
	}

	h2 {
		margin: var(--space-6) 0 var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.more {
		margin-top: var(--space-4);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
