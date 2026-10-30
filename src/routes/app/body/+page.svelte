<script lang="ts">
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import { CheckIn, type CheckInResult } from '#lib/body/ui/check-in.svelte.ts';
	import CheckInForm from '#lib/body/ui/CheckInForm.svelte';
	import { ObjectUrls } from '#lib/body/ui/object-urls.ts';
	import { PhotoGallery } from '#lib/body/ui/photo-gallery.svelte.ts';
	import PhotoTiles from '#lib/body/ui/PhotoTiles.svelte';
	import { photoTiles, weightChange, weightsSince } from '#lib/body/ui/body-trends.ts';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import { ChartSize } from '#lib/design/chart.constants.ts';
	import TrendLine from '#lib/design/TrendLine.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { unitLabel } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';

	const CHART_DAYS = 90;
	const KG_PADDING = 0.15;
	const LB_PADDING = 0.3;

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

{#if body !== undefined && gallery !== undefined && checkIn !== undefined}
	{@const unit = preferences.massUnit}
	{@const weights = weightsSince(body.weighIns, body.today.addDays(1 - CHART_DAYS), unit)}
	{@const change = weightChange(weights)}
	<CheckInForm {checkIn} unit={unitLabel(unit)} onsaved={saved} />

	<section class="section" aria-labelledby="last-days">
		<h2 id="last-days">{messages.checkIn.lastNinetyDays}</h2>
		<BigNumber value={change.text} suffix={unitLabel(unit)} />
		{#if weights.length > 0}
			<TrendLine
				values={weights}
				padding={unit === MassUnit.kg ? KG_PADDING : LB_PADDING}
				size={ChartSize.tall}
				summary={messages.checkIn.chart({
					direction: change.direction,
					change: change.amount,
					unit: unitLabel(unit),
					latest: change.latest
				})}
			/>
		{/if}
	</section>

	<section class="section photos" aria-labelledby="photos">
		<div class="photos-heading">
			<h2 id="photos">{messages.checkIn.photos}</h2>
			{#if gallery.photos.length > 1}
				<a href={resolve(AppRoute.photos)}>{messages.checkIn.compare}</a>
			{/if}
		</div>
		<PhotoTiles {gallery} tiles={photoTiles(gallery.photos, body.weighIns, unit)} />
	</section>
{/if}

<style>
	.section {
		display: flex;
		flex-direction: column;
		gap: var(--gap-14);
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-6) var(--gutter);
		border-top: var(--border-hairline) solid var(--color-divider);
	}

	.photos {
		padding-bottom: 0;
	}

	h2 {
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
	}

	.photos-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.photos-heading a {
		display: flex;
		align-items: center;
		min-height: var(--tap-target);
		color: var(--color-accent);
		font-size: var(--font-size-15);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
	}
</style>
