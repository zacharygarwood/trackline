<script lang="ts">
	import { getAppContext } from '#lib/app/app-context.ts';
	import type { App } from '#lib/app/container.ts';
	import Button from '#lib/design/Button.svelte';
	import { ButtonVariant } from '#lib/design/button.constants.ts';
	import SectionTitle from '#lib/design/SectionTitle.svelte';
	import SegmentedControl from '#lib/design/SegmentedControl.svelte';
	import { messages } from '#lib/i18n/messages.en.ts';
	import { getPreferences } from '#lib/settings/ui/app-preferences.svelte.ts';
	import { DistanceUnit } from '#lib/shared/distance-unit.constants.ts';
	import { MassUnit } from '#lib/shared/mass-unit.constants.ts';
	import { WeekStart } from '#lib/shared/week-start.constants.ts';
	import GoalInput from '#lib/tracking/ui/GoalInput.svelte';
	import { Onboarding } from '#lib/tracking/ui/onboarding.svelte.ts';
	import { OnboardingStep } from '#lib/tracking/ui/onboarding.constants.ts';
	import { TEMPLATE_SECTIONS } from '#lib/tracking/ui/template-groups.ts';
	import TemplateRow from '#lib/tracking/ui/TemplateRow.svelte';
	import { AppRoute } from '../app-route.constants.ts';
	import { replace } from '../open.ts';

	const preferences = getPreferences();
	const units = $derived({
		mass: preferences.massUnit,
		distance: preferences.current.distanceUnit
	});
	const onboarding = new Onboarding();
	let app: App | undefined = $state();
	let starting = $state(false);

	void getAppContext().then((ready) => (app = ready));

	async function start(ready: App): Promise<void> {
		starting = true;
		const added = await onboarding.finish(ready.tracking.addTrackers);
		if (added) {
			await ready.settings.completeSetup.execute();
			await replace(AppRoute.today);
		}
		starting = false;
	}
</script>

{#if preferences.loaded && onboarding.step === OnboardingStep.pick}
	<h1>{messages.tracking.onboarding.title}</h1>
	<p class="intro">{messages.tracking.onboarding.intro}</p>
	{#each TEMPLATE_SECTIONS as section (section.group)}
		{@const id = `pick-${section.group}`}
		<SectionTitle title={messages.tracking.groups[section.group]} {id} />
		<ul aria-labelledby={id}>
			{#each section.templates as template (template.key)}
				<li>
					<TemplateRow
						{template}
						pressed={onboarding.isPicked(template.key)}
						onclick={() => {
							onboarding.toggle(template.key);
						}}
					/>
				</li>
			{/each}
		</ul>
	{/each}
	{#if onboarding.problem !== undefined}
		<p class="problem" role="alert">{onboarding.problem}</p>
	{/if}
	<div class="actions">
		<Button
			onclick={() => {
				onboarding.toUnits();
			}}>{messages.tracking.onboarding.nextWith(onboarding.picked.length)}</Button
		>
	</div>
{:else if preferences.loaded && onboarding.step === OnboardingStep.units}
	<h1>{messages.tracking.onboarding.unitsTitle}</h1>
	<div class="units">
		<SegmentedControl
			label={messages.preferences.weight}
			options={[
				{ value: MassUnit.kg, label: messages.units.kgLong },
				{ value: MassUnit.lb, label: messages.units.lbLong }
			]}
			value={preferences.massUnit}
			onchange={(unit: MassUnit) => void preferences.chooseMassUnit(unit)}
		/>
		<SegmentedControl
			label={messages.preferences.distance}
			options={Object.values(DistanceUnit).map((value) => ({ value, label: value }))}
			value={preferences.current.distanceUnit}
			onchange={(distanceUnit: DistanceUnit) => void preferences.change({ distanceUnit })}
		/>
		<SegmentedControl
			label={messages.preferences.weekStarts}
			options={[
				{ value: WeekStart.monday, label: messages.preferences.monday },
				{ value: WeekStart.sunday, label: messages.preferences.sunday }
			]}
			value={preferences.weekStart}
			onchange={(day: WeekStart) => void preferences.chooseWeekStart(day)}
		/>
	</div>
	<div class="actions">
		<Button
			onclick={() => {
				onboarding.toGoals(units);
			}}>{messages.tracking.onboarding.next}</Button
		>
		<Button
			variant={ButtonVariant.quiet}
			onclick={() => {
				onboarding.back();
			}}>{messages.tracking.onboarding.back}</Button
		>
	</div>
{:else if preferences.loaded && app !== undefined}
	{@const ready = app}
	<h1>{messages.tracking.onboarding.goalsTitle}</h1>
	<p class="intro">{messages.tracking.onboarding.goalsIntro}</p>
	{#each onboarding.goals as { template, editor } (template.key)}
		<section>
			<SectionTitle title={messages.tracking.templates[template.key]} />
			<GoalInput {editor} {units} simple />
		</section>
	{/each}
	{#if onboarding.problem !== undefined}
		<p class="problem" role="alert">{onboarding.problem}</p>
	{/if}
	<div class="actions">
		<Button disabled={starting} onclick={() => start(ready)}
			>{messages.tracking.onboarding.start}</Button
		>
		<Button
			variant={ButtonVariant.quiet}
			onclick={() => {
				onboarding.back();
			}}>{messages.tracking.onboarding.back}</Button
		>
	</div>
{/if}

<style>
	h1 {
		margin: var(--space-2) 0 var(--space-3);
		font-size: var(--font-size-34);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-title);
		line-height: var(--line-height-title);
	}

	.intro {
		color: var(--color-text-muted);
		font-size: var(--font-size-16);
	}

	.units {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		margin-top: var(--space-6);
	}

	.problem {
		margin-top: var(--space-4);
		color: var(--color-danger);
		font-size: var(--font-size-15);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-8) 0;
	}
</style>
