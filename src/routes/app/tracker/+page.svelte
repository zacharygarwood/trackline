<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import BigNumber from '#lib/design/BigNumber.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { TrackerKind } from '#lib/tracking/domain/tracking.constants.ts';
	import { PhotoUrls } from '#lib/tracking/ui/photo-urls.ts';
	import { TrackerScreen } from '#lib/tracking/ui/tracker-screen.svelte.ts';
	import { goalDetail, progressText } from '#lib/tracking/ui/value-format.ts';
	import { getToaster, reloadOnUndo } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../app-route.constants.ts';
	import { open, replace } from '../open.ts';
	import CollectionSection from './CollectionSection.svelte';
	import FoodSection from './FoodSection.svelte';
	import LogSection from './LogSection.svelte';
	import PhotosSection from './PhotosSection.svelte';
	import WorkoutSection from './WorkoutSection.svelte';

	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let screen: TrackerScreen | undefined = $state();
	let photos: PhotoUrls | undefined = $state();
	let today: LocalDate | undefined = $state();
	const trackerId = $derived(screen?.tracker?.id);

	void getAppContext().then(async (app) => {
		const next = new TrackerScreen(app.tracking, app.clock, preferences.weekStart);
		if (!(await next.load(page.state.tracker))) {
			await replace(AppRoute.today);
			return;
		}
		today = app.clock.today();
		photos = new PhotoUrls(app.tracking.getPhotoImage);
		screen = next;
	});

	reloadOnUndo(getToaster(), async () => {
		await screen?.load(page.state.tracker);
	});

	onDestroy(() => void photos?.clear());
</script>

<PageHeader
	backHref={resolve(AppRoute.today)}
	backLabel={messages.shell.back(messages.navigation.home)}
	title={screen?.tracker?.name ?? ''}
	actionIcon="settings"
	actionLabel={messages.tracking.page.editTracker}
	onaction={trackerId === undefined
		? undefined
		: () => open(AppRoute.editTracker, { tracker: trackerId })}
/>

{#if screen?.tracker !== undefined && today !== undefined && photos !== undefined}
	{@const tracker = screen.tracker}
	{@const progress = screen.progress}
	{#if progress?.value !== undefined}
		<div class="summary">
			<BigNumber
				value={progressText(tracker, progress.value, units)}
				suffix={goalDetail(tracker, units)}
			/>
		</div>
	{/if}

	{#if tracker.kind === TrackerKind.log}
		<LogSection {screen} {tracker} {units} {today} />
	{:else if tracker.kind === TrackerKind.photos}
		<PhotosSection {screen} {tracker} {photos} />
	{:else if tracker.kind === TrackerKind.collection}
		<CollectionSection {screen} {tracker} {today} />
	{:else if tracker.kind === TrackerKind.workout}
		<WorkoutSection {screen} {tracker} {today} />
	{:else}
		<FoodSection {screen} {tracker} {units} {today} />
	{/if}
{/if}

<style>
	.summary {
		margin: var(--space-2) 0 var(--space-6);
	}
</style>
