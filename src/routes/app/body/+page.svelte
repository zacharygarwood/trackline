<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import { BodyScreen } from '#lib/body/ui/body-screen.svelte.ts';
	import WeighInHistory from '#lib/body/ui/WeighInHistory.svelte';
	import WeighInSheet from '#lib/body/ui/WeighInSheet.svelte';
	import WeightChart from '#lib/body/ui/WeightChart.svelte';
	import type { WeighIn } from '#lib/body/domain/weigh-in.ts';
	import Button from '#lib/design/Button.svelte';
	import EmptyState from '#lib/design/EmptyState.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import type { LocalDate } from '#lib/shared/local-date.ts';
	import { formatDate } from '#lib/ui/format.ts';

	/** The weigh-in being entered: a new one for today, or an existing one being edited. */
	interface Editing {
		readonly date: LocalDate;
		readonly existing: WeighIn | undefined;
	}

	let screen: BodyScreen | undefined = $state();
	let editing: Editing | undefined = $state();

	void getAppContext().then(async (app) => {
		const next = new BodyScreen({ ...app.body, getMassUnit: app.settings.getMassUnit }, app.clock);
		await next.load();
		screen = next;
	});

	function weighInToday(today: LocalDate): void {
		editing = { date: today, existing: undefined };
	}
</script>

{#if screen !== undefined}
	{@const ready = screen}
	<div class="body">
		<Button
			onclick={() => {
				weighInToday(ready.today);
			}}>{messages.body.weighIn}</Button
		>
		{#if ready.weighIns.length === 0}
			<EmptyState message={messages.body.empty} />
		{:else}
			<WeightChart weighIns={ready.weighIns} goal={ready.goal} unit={ready.unit} />
			<WeighInHistory
				weighIns={ready.weighIns}
				unit={ready.unit}
				today={ready.today}
				onselect={(weighIn: WeighIn) => (editing = { date: weighIn.date, existing: weighIn })}
			/>
		{/if}
	</div>

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
	.body {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding-bottom: var(--space-6);
	}
</style>
