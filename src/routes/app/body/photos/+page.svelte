<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import { photoTiles, weightChange } from '#lib/body/ui/body-trends.ts';
	import { ObjectUrls } from '#lib/body/ui/object-urls.ts';
	import { PhotoGallery } from '#lib/body/ui/photo-gallery.svelte.ts';
	import PhotoTiles from '#lib/body/ui/PhotoTiles.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { last } from '#lib/shared/collections.ts';
	import { unitLabel } from '#lib/ui/format.ts';
	import { AppRoute } from '../../app-route.constants.ts';

	const preferences = getPreferences();
	let body: BodyScreen | undefined = $state();
	let gallery: PhotoGallery | undefined = $state();

	void getAppContext().then(async (app) => {
		const nextBody = new BodyScreen(
			{ ...app.body, getMassUnit: app.settings.getMassUnit },
			app.clock
		);
		const photos = new PhotoGallery(app.body, app.clock, new ObjectUrls());
		await Promise.all([nextBody.load(), photos.load()]);
		body = nextBody;
		gallery = photos;
	});

	$effect(() => () => {
		void gallery?.dispose();
	});
</script>

<div class="compare">
	<a href={resolve(AppRoute.body)}>{messages.checkIn.backToBody}</a>
	{#if body !== undefined && gallery !== undefined}
		{@const newest = gallery.photos.at(0)}
		{@const oldest = last(gallery.photos)}
		{#if newest !== undefined && oldest !== undefined}
			{@const unit = preferences.massUnit}
			{@const tiles = photoTiles([oldest, newest], body.weighIns, unit)}
			{@const weights = [oldest, newest].flatMap((photo) => {
				const weighIn = body?.weighIns.find((known) => known.date.equals(photo.date));
				return weighIn === undefined ? [] : [weighIn.weight.toUnit(unit)];
			})}
			<h1>{weightChange(weights).text} {unitLabel(unit)}</h1>
			<PhotoTiles {gallery} {tiles} compare />
		{/if}
	{/if}
</div>

<style>
	.compare {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	a {
		display: flex;
		align-items: center;
		align-self: flex-start;
		min-height: var(--tap-target);
		color: var(--color-text-muted);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}

	h1 {
		font-size: var(--font-size-34);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-title);
	}
</style>
