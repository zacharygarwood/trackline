<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import LatestPhotos from '#lib/body/ui/LatestPhotos.svelte';
	import { ObjectUrls } from '#lib/body/ui/object-urls.ts';
	import { PhotoGallery } from '#lib/body/ui/photo-gallery.svelte.ts';
	import WeighInHistory from '#lib/body/ui/WeighInHistory.svelte';
	import WeighInSheet from '#lib/body/ui/WeighInSheet.svelte';
	import WeightChart from '#lib/body/ui/WeightChart.svelte';
	import type { WeighIn } from '#lib/body/domain/weigh-in.ts';
	import Card from '#lib/design/Card.svelte';
	import Fab from '#lib/design/Fab.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { first } from '#lib/shared/collections.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { formatDate } from '#lib/ui/format.ts';
	import { AppRoute } from '../app-route.constants.ts';

	/** The weigh-in being entered: a new one for today, or an existing one being edited. */
	interface Editing {
		readonly date: LocalDate;
		readonly existing: WeighIn | undefined;
	}

	let screen: BodyScreen | undefined = $state();
	let gallery: PhotoGallery | undefined = $state();
	let editing: Editing | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new BodyScreen({ ...app.body, getMassUnit: app.settings.getMassUnit }, app.clock);
		const photos = new PhotoGallery(app.body, app.clock, new ObjectUrls());
		await Promise.all([next.load(), photos.load()]);
		screen = next;
		gallery = photos;
	});

	$effect(() => () => {
		void gallery?.dispose();
	});

	function weighInToday(today: LocalDate): void {
		editing = { date: today, existing: undefined };
	}
</script>

{#if screen !== undefined}
	{@const ready = screen}
	{@const latest = first(ready.weighIns)}
	{#if latest !== undefined}
		<Card title={messages.stats.weight}>
			<WeightChart weighIns={ready.weighIns} goal={ready.goal} unit={ready.unit} />
		</Card>
	{/if}
	{#if gallery !== undefined}
		<LatestPhotos {gallery} onopen={() => goto(resolve(AppRoute.photos))}>
			{#snippet allPhotos()}
				<a class="all-photos" href={resolve(AppRoute.photos)}>{messages.body.allPhotos}</a>
			{/snippet}
		</LatestPhotos>
	{/if}
	{#if ready.weighIns.length > 0}
		<WeighInHistory
			weighIns={ready.weighIns}
			unit={ready.unit}
			today={ready.today}
			onselect={(weighIn: WeighIn) => (editing = { date: weighIn.date, existing: weighIn })}
		/>
	{/if}
	<Fab
		label={messages.body.weighIn}
		onclick={() => {
			weighInToday(ready.today);
		}}
	/>

	{#if editing !== undefined}
		{@const current = editing}
		{@const existing = current.existing}
		<WeighInSheet
			title={current.date.equals(ready.today)
				? messages.body.weighIn
				: formatDate(current.date, ready.today)}
			suggestion={ready.suggestionFor(current.date)}
			unit={ready.unit}
			onsave={(entry: string) => ready.record(current.date, entry)}
			ondelete={existing === undefined ? undefined : () => ready.remove(existing)}
			onclose={() => (editing = undefined)}
		/>
	{/if}
{/if}

<style>
	.all-photos {
		color: var(--color-accent);
	}
</style>
