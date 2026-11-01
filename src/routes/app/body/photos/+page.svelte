<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import { photoTiles } from '#lib/body/ui/body-trends.ts';
	import { ObjectUrls } from '#lib/body/ui/object-urls.ts';
	import { PhotoGallery } from '#lib/body/ui/photo-gallery.svelte.ts';
	import PhotoTiles from '#lib/body/ui/PhotoTiles.svelte';
	import NavRow from '#lib/design/NavRow.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
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

<PageHeader
	backHref={resolve(AppRoute.body)}
	backLabel={messages.shell.back(messages.home.weight)}
	title={messages.checkIn.photos}
/>

{#if body !== undefined && gallery !== undefined}
	{#if gallery.photos.length > 1}
		<div class="compare">
			<NavRow label={messages.navigation.compare} href={resolve(AppRoute.compare)} />
		</div>
	{/if}
	{#if gallery.photos.length === 0}
		<p class="empty">{messages.checkIn.noPhotos}</p>
	{:else}
		<PhotoTiles {gallery} tiles={photoTiles(gallery.photos, body.weighIns, preferences.massUnit)} />
	{/if}
{/if}

<style>
	.compare {
		margin: 0 calc(-1 * var(--gutter)) var(--space-5);
		padding: 0 var(--gutter);
	}

	.empty {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}
</style>
