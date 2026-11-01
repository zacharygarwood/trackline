<script lang="ts">
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Row from '#lib/design/Row.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { PhotoSize } from '#lib/tracking/application/photo-size.constants.ts';
	import { FieldType } from '#lib/tracking/domain/tracking.constants.ts';
	import { EntryScreen } from '#lib/tracking/ui/entry-screen.svelte.ts';
	import PhotoImage from '#lib/tracking/ui/PhotoImage.svelte';
	import { PhotoUrls } from '#lib/tracking/ui/photo-urls.ts';
	import { formatValue } from '#lib/tracking/ui/value-format.ts';
	import { formatShortDate } from '#lib/ui/format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, replace } from '../../open.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let screen: EntryScreen | undefined = $state();
	let photos: PhotoUrls | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new EntryScreen(app.tracking);
		if (!(await next.load({ tracker: page.state.tracker, entry: page.state.entry }))) {
			await replace(AppRoute.today);
			return;
		}
		photos = new PhotoUrls(app.tracking.getPhotoImage);
		screen = next;
	});

	onDestroy(() => void photos?.clear());

	async function remove(ready: EntryScreen): Promise<void> {
		const undo = await ready.delete();
		toaster.show(messages.tracking.page.deleted, undo);
		back();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={screen?.entry === undefined ? '' : formatShortDate(screen.entry.date)}
	onback={back}
/>

{#if screen?.tracker !== undefined && screen.entry !== undefined && photos !== undefined}
	{@const ready = screen}
	{@const entry = screen.entry}
	{#if ready.subject !== undefined}
		<p class="subject">{ready.subject.name}</p>
	{/if}
	<ul>
		{#each screen.tracker.fields as field (field.key)}
			{@const value = entry.values.get(field.key)}
			{#if value?.type === FieldType.photo}
				<li class="photo">
					<PhotoImage src={photos.url(value.photoId, PhotoSize.full)} alt={field.label} whole />
				</li>
			{:else if value?.type === FieldType.note}
				<li class="note">{value.text}</li>
			{:else if value !== undefined}
				<li><Row label={field.label} value={formatValue(field, value, units)} /></li>
			{/if}
		{/each}
	</ul>

	<div class="delete">
		<Button variant={ButtonVariant.secondary} onclick={() => remove(ready)}
			>{messages.tracking.page.deleteEntry}</Button
		>
	</div>
{/if}

<style>
	.subject {
		margin-bottom: var(--space-4);
		font-size: var(--font-size-20);
		font-weight: var(--font-weight-semibold);
	}

	.photo {
		margin-bottom: var(--space-4);
	}

	.note {
		padding: var(--space-4) 0;
		font-size: var(--font-size-17);
		white-space: pre-wrap;
	}

	.delete {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-9);
	}
</style>
