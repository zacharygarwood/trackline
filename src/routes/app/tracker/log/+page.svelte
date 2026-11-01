<script lang="ts">
	import { onDestroy } from 'svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { PhotoSize } from '#lib/tracking/application/photo-size.constants.ts';
	import { FieldType } from '#lib/tracking/domain/tracking.constants.ts';
	import FieldInput from '#lib/tracking/ui/FieldInput.svelte';
	import { LogScreen } from '#lib/tracking/ui/log-screen.svelte.ts';
	import { PhotoUrls } from '#lib/tracking/ui/photo-urls.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, replace } from '../../open.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = { mass: preferences.massUnit, distance: preferences.current.distanceUnit };
	let screen: LogScreen | undefined = $state();
	let photos: PhotoUrls | undefined = $state();
	let saving = $state(false);

	void getAppContext().then(async (app) => {
		const next = new LogScreen(app.tracking, units);
		if (!(await next.load({ tracker: page.state.tracker, subject: page.state.subject }))) {
			await replace(AppRoute.today);
			return;
		}
		photos = new PhotoUrls(app.tracking.getPhotoImage);
		screen = next;
	});

	onDestroy(() => {
		void screen?.leave();
		void photos?.clear();
	});

	async function save(ready: LogScreen): Promise<void> {
		saving = true;
		const entry = await ready.save();
		saving = false;
		if (entry === undefined || ready.tracker === undefined) return;
		toaster.show(messages.tracking.page.logged(ready.subject?.name ?? ready.tracker.name));
		back();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.tracker)}
	backLabel={messages.shell.back(screen?.tracker?.name ?? messages.navigation.home)}
	title={screen?.subject?.name ?? screen?.tracker?.name ?? ''}
	onback={back}
/>

{#if screen?.form !== undefined && photos !== undefined}
	{@const ready = screen}
	{@const urls = photos}
	<form
		onsubmit={(event) => {
			event.preventDefault();
			void save(ready);
		}}
	>
		{#each ready.form?.fields ?? [] as field (field.key)}
			{@const draft = ready.form?.drafts[field.key]}
			{#if draft !== undefined}
				<FieldInput
					{field}
					{draft}
					{units}
					onphoto={(image: Uint8Array) => void ready.attach(field, image)}
					photoUrl={draft.type === FieldType.photo && draft.picked?.type === FieldType.photo
						? urls.url(draft.picked.photoId, PhotoSize.thumbnail)
						: undefined}
				/>
			{/if}
		{/each}

		{#if ready.problem !== undefined}
			<p class="problem" role="alert">{ready.problem}</p>
		{/if}
		<div class="save">
			<Button type="submit" disabled={saving}>{messages.tracking.page.save}</Button>
		</div>
	</form>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	.problem {
		margin-top: var(--space-4);
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.save {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-8);
	}
</style>
