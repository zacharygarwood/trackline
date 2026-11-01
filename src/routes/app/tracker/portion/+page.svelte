<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getAppContext } from '#lib/app/app-context.ts';
	import Button from '#lib/design/Button.svelte';
	import PageHeader from '#lib/design/PageHeader.svelte';
	import Row from '#lib/design/Row.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { servingsFieldOf } from '#lib/tracking/domain/portion.ts';
	import { FieldType } from '#lib/tracking/domain/tracking.constants.ts';
	import { PortionScreen } from '#lib/tracking/ui/portion-screen.svelte.ts';
	import StepperField from '#lib/tracking/ui/StepperField.svelte';
	import { formatValue } from '#lib/tracking/ui/value-format.ts';
	import { getToaster } from '#lib/ui/toast.svelte.ts';
	import { AppRoute } from '../../app-route.constants.ts';
	import { back, backTwice, replace } from '../../open.ts';

	const preferences = getPreferences();
	const toaster = getToaster();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	let screen: PortionScreen | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new PortionScreen(app.tracking);
		if (!(await next.load({ tracker: page.state.tracker, subject: page.state.subject }))) {
			await replace(AppRoute.today);
			return;
		}
		screen = next;
	});

	async function save(ready: PortionScreen): Promise<void> {
		if (!(await ready.save())) return;
		toaster.show(messages.tracking.page.logged(ready.food?.name ?? ''));
		backTwice();
	}
</script>

<PageHeader
	backHref={resolve(AppRoute.addFood)}
	backLabel={messages.shell.back(messages.tracking.food.add)}
	title={screen?.food?.name ?? ''}
	onback={back}
/>

{#if screen?.tracker !== undefined && screen.food !== undefined}
	{@const ready = screen}
	{@const tracker = screen.tracker}
	{@const servings = servingsFieldOf(tracker.fields)}
	{@const values = ready.values}
	<StepperField
		label={servings?.unit ?? messages.tracking.food.servings}
		value={ready.servings}
		lessLabel={messages.tracking.inputs.less(messages.tracking.food.servings)}
		moreLabel={messages.tracking.inputs.more(messages.tracking.food.servings)}
		oninput={(text: string) => (ready.servings = text)}
		onstep={(direction: number) => {
			ready.step(direction);
		}}
	/>
	{#if values.ok}
		<ul class="preview">
			{#each tracker.fields as field (field.key)}
				{@const value = values.value.get(field.key)}
				{#if value !== undefined && field.key !== servings?.key && value.type === FieldType.number}
					<li><Row label={field.label} value={formatValue(field, value, units)} /></li>
				{/if}
			{/each}
		</ul>
	{/if}
	<div class="save">
		<Button disabled={!values.ok} onclick={() => save(ready)}
			>{messages.tracking.food.add_portion}</Button
		>
	</div>
{/if}

<style>
	.preview {
		margin-top: var(--space-6);
	}

	.save {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-8);
	}
</style>
